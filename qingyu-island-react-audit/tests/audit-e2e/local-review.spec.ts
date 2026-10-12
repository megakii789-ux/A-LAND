import { test, expect, Page } from '@playwright/test';
import fs from 'node:fs';

async function openAdult(page:Page) {
  await page.getByRole('button',{name:'进入大人工作台'}).click();
  await page.locator('#parent-pin').fill('826491');
  if(await page.locator('#parent-pin-repeat').count()) {
    await page.locator('#parent-pin-repeat').fill('826491');
  }
  await page.getByRole('button',{name:/设置并进入|进入大人工作台/,exact:false}).last().click();
  await expect(page.getByRole('heading',{name:'给大人的工作台'})).toBeVisible();
}
test.beforeEach(async({page})=>{await page.goto('/');});
test('home has no horizontal overflow, nested controls or undersized main targets',async({page},info)=>{
  await expect(page.getByRole('heading',{name:'今天，按你的节奏来'})).toBeVisible();
  const measurements=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
    nested:document.querySelectorAll('button button').length,
    small:[...document.querySelectorAll('button')].filter(b=>{
      const r=b.getBoundingClientRect();return r.width<55.9||r.height<55.9;
    }).map(b=>b.getAttribute('aria-label')||b.textContent)
  }));
  expect(measurements).toEqual({overflow:false,nested:0,small:[]});
  fs.mkdirSync('audit/browser-artifacts',{recursive:true});
  await page.screenshot({path:`audit/browser-artifacts/home-${info.project.name}.png`,fullPage:true});
});
test('native modal keeps focus inside and Escape returns to trigger',async({page})=>{
  const trigger=page.getByRole('button',{name:'进入绿草平静角'});
  await trigger.click();
  const dialog=page.getByRole('dialog',{name:'绿草平静角'});
  await expect(dialog).toBeVisible();
  for(let i=0;i<15;i++){
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(d=>d.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test('weather has no preselected sunny answer and opt-out is a complete route',async({page})=>{
  await page.getByRole('button',{name:'进入情绪天气站'}).click();
  const dialog=page.getByRole('dialog',{name:'情绪天气站'});
  await expect(dialog.locator('button[aria-pressed="true"]')).toHaveCount(0);
  await dialog.getByRole('button',{name:'我不想选，也可以回去玩'}).click();
  await expect(dialog).not.toBeVisible();
});
test('rain does not auto-route to calm or take away the story option',async({page})=>{
  await page.getByRole('button',{name:'进入情绪天气站'}).click();
  const dialog=page.getByRole('dialog',{name:'情绪天气站'});
  await dialog.getByRole('button',{name:/^雨/}).click();
  await dialog.getByRole('button',{name:'选好了',exact:true}).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button',{name:'听一个小故事'})).toBeVisible();
  await expect(dialog.getByRole('button',{name:'回小岛自己选'})).toBeVisible();
});
test('local support does not send network messages or promise delivery',async({page})=>{
  const apiRequests:string[]=[];
  page.on('request',r=>{if(r.url().includes('/api/'))apiRequests.push(r.url());});
  await page.getByRole('button',{name:'我想找身边的大人'}).click();
  const dialog=page.getByRole('dialog',{name:'你现在需要什么？'});
  await expect(dialog.getByText('这里不会发消息。可以直接去找身边你信任的大人。')).toBeVisible();
  await dialog.getByRole('button',{name:/请身边的人陪一会儿/}).click();
  await expect(dialog.getByRole('heading',{name:'我想请你陪一会儿'})).toBeVisible();
  expect(apiRequests).toEqual([]);
});
test('parent gate has no arithmetic bypass and relocks when returning to child',async({page})=>{
  await openAdult(page);
  await page.getByRole('button',{name:'返回小岛并锁定大人工作台'}).click();
  await page.getByRole('button',{name:'进入大人工作台'}).click();
  await expect(page.locator('#parent-pin-repeat')).toHaveCount(0);
  await page.locator('#parent-pin').fill('826492');
  await page.getByRole('button',{name:'进入大人工作台',exact:true}).last().click();
  await expect(page.getByRole('heading',{name:'给大人的工作台'})).not.toBeVisible();
});
test('family stories are hidden until adult configuration, and need co-play confirmation',async({page})=>{
  await page.getByRole('button',{name:'进入故事林'}).click();
  const dialog=page.getByRole('dialog',{name:'故事林'});
  await expect(dialog.getByRole('button',{name:'打开故事：两个家的规则不一样'})).toHaveCount(0);
  await dialog.getByRole('button',{name:'关闭故事林'}).click();
  await openAdult(page);
  await page.getByRole('button',{name:'生活安排',exact:true}).click();
  await page.getByRole('checkbox',{name:/我已准备先审阅/}).check();
  await page.getByRole('button',{name:'返回小岛并锁定大人工作台'}).click();
  await page.getByRole('button',{name:'进入故事林'}).click();
  await dialog.getByRole('button',{name:'打开故事：两个家的规则不一样'}).click();
  await expect(page.getByRole('dialog',{name:'给大人的小门'})).toBeVisible();
});
test('no automatic local persistence; consent is explicit',async({page})=>{
  expect(await page.evaluate(()=>localStorage.getItem('qingyu_review_state_v2'))).toBeNull();
  await openAdult(page);
  await page.getByRole('button',{name:'本机数据',exact:true}).click();
  await page.getByRole('checkbox',{name:/我理解这些限制/}).check();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('qingyu_review_consent_v2'))).toBe('yes');
  const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('qingyu_review_state_v2')||'null'));
  expect(Object.keys(data).sort()).toEqual(['careWeek','completedLeaves','familyContent','version']);
});
test('an unsigned base64 identity cannot activate API access',async({request})=>{
  const fake=Buffer.from(JSON.stringify({uid:'fake',familyId:'any',role:'CAREGIVER',scopes:['family:manage']})).toString('base64');
  const response=await request.post('/api/family/any/hug',{headers:{Authorization:`Bearer ${fake}`},data:{}});
  expect(response.status()).toBe(503);
  expect((await response.json()).code).toBe('API_DISABLED_PENDING_VERIFIED_AUTH');
});
