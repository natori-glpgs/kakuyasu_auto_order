const puppeteer = require('puppeteer')
const readlineSync = require('readline-sync');

// アカウント情報
const account = require('./settings/account.json')
const EMAIL = account.email
const PASSWORD = account.password
// 注文関連の設定
const settings = require('./settings/order_setting.json')
// DEBUGが0だと実際に注文される
const DEBUG = settings.debug
const DEMO_MODE = settings.demo_mode
const REAL_ORDER = settings.real_order
const AGE = settings.age
const DELIVERY_TIME = settings.delivery_time // string
const RECEIPT_NAME = settings.receipt_name

// Main
puppeteer.launch({
    headless: false,
    slowMo: 50
  }).then(async browser => {
    const page = await browser.newPage()
    // 1. ログイン
    const LOGIN_PAGE = 'https://www.kakuyasu.co.jp/ec/common/CSfLogin.jsp'
    const LOGIN_BUTTON_SELECTOR = '#bodyContainer > form > div.login_left > div > div.loginbtn > input'
    const EMAIL_SELECTOR = '#bodyContainer > form > div.login_left > div > div.heightLine-group99 > div > dl:nth-child(1) > dd > ul > li > input'
    const PASSWORD_SELECTOR = '#bodyContainer > form > div.login_left > div > div.heightLine-group99 > div > dl:nth-child(2) > dd > ul > li > input'
    console.log('Login start')
    try {
      if (DEMO_MODE) demoWait()
      await page.goto(LOGIN_PAGE, {waitUntil: "domcontentloaded"})
      if (DEMO_MODE) demoWait()
      await page.type(EMAIL_SELECTOR, EMAIL)
      await page.type(PASSWORD_SELECTOR, PASSWORD)
      page.click(LOGIN_BUTTON_SELECTOR)
      await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } catch (e) {
      console.log('Login failed')
      console.log(e)
      return 1
    }
    console.log('Login finish')
    // 2. 注文が残っている場合があるので、カートを確認して残っていたら削除
    const CART_PAGE = 'http://www.kakuyasu.co.jp/ec/disp/CCtViewCartLink.jsp'
    const DELETE_ALL_ITEM_BUTTON = '#contentsContainer > form > div.mt15.tac > a'
    console.log('Clear cart start')
    try {
      if (DEMO_MODE) demoWait()
      await page.goto(CART_PAGE, {waitUntil: "domcontentloaded"})
      if (DEMO_MODE) demoWait()
      if (!!await page.$(DELETE_ALL_ITEM_BUTTON)) {
        // 削除ボタンを押下すると確認ダイアログが出てくるので許可するよう設定
        page.on('dialog', dialog => {
          dialog.accept();
        })
        console.log('Delete cart items')
        page.click(DELETE_ALL_ITEM_BUTTON)
        await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
      }
    } catch (e) {
      console.log('Delete cart items failed')
      console.log(e)
    }
    console.log('Clear cart finish')
    // 3. 定番注文ページ
    const TEIBAN_PAGE = 'https://www.kakuyasu.co.jp/ec/member/CMmStdGdDisp.jsp'
    const TEIBAN_ADD_CART_BUTTON_SELECTOR = '#bodyContainer > table > tbody > tr:nth-child(4) > td:nth-child(7) > input:nth-child(1)'
    console.log('Favorite order to cart start')
    try {
      if (DEMO_MODE) demoWait()
      await page.goto(TEIBAN_PAGE, {waitUntil: "domcontentloaded"})
      if (DEMO_MODE) demoWait()
      page.click(TEIBAN_ADD_CART_BUTTON_SELECTOR)
      await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } catch (e) {
      console.log('Teiban failed')
      console.log(e)
      return 1
    }
    console.log('Favorite order to cart finish')
    // カートページに遷移する
    // 4. 注文ページに移動
    const GO_ORDER_PAGE_BUTTON_SELECTOR = '#goOrder'
    console.log('Go order page start')
    try {
      if (DEMO_MODE) demoWait()
      page.click(GO_ORDER_PAGE_BUTTON_SELECTOR)
      await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } catch (e) {
      console.log('Go order page failed')
      console.log(e)
      return 1
    }
    console.log('Go order page finish')
    // 5. 注文ページの直前でログインを求められる
    // 注文ページ直前のログイン用
    const LOGIN_ORDER_BUTTON_SELECTOR = '#bodyContainer > form > div.login_left > div > div.loginbtn > input'
    console.log('Login before order start')
    try {
      if (DEMO_MODE) demoWait()
      // デフォルトではメールアドレスが入っているが、気になるのでDOMの値を上書きする
      // page.typeで無くてもこういう方法で書ける
      await page.evaluate((text) => { document.getElementsByName('ID')[0].value = text; }, EMAIL)
      await page.evaluate((text) => { document.getElementsByName('PWD')[0].value = text; }, PASSWORD)
      if (DEMO_MODE) demoWait()
      page.click(LOGIN_ORDER_BUTTON_SELECTOR)
      await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } catch (e) {
      console.log('Login for order failed')
      console.log(e)
      return 1
    }
    console.log('Login before order finish')
    // 6. 注文フォーム
    // 注文フォーム1: 住所と年齢
    // 住所はデフォルトとする
    const GO_DELIVERY_TIME_BUTTON_SELECTOR = '#setDelDay'
    console.log('Order Form #1: Address and age confirmation form start')
    try {
      if (DEMO_MODE) demoWait()
      await page.evaluate((age) => { document.getElementsByName('PURCHASER_AGE')[0].value = age; }, AGE)
      if (DEMO_MODE) demoWait()
      page.click(GO_DELIVERY_TIME_BUTTON_SELECTOR)
      await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } catch (e) {
      console.log('Order form #1 failed')
      console.log(e)
    }
    console.log('Order Form #1 finish')
    // 注文フォーム2: 配達日
    const GO_PAYMENT_METHOD_BUTTON = '#imgGoNext'
    console.log('Order Form #2: Delivery day form start')
    // 冷やしたいが時間指定制限が面倒なのでとりあえず最速で送ってもらう
    try {
      if (DEMO_MODE) demoWait()
      page.click(GO_PAYMENT_METHOD_BUTTON)
      await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } catch (e) {
      console.log('Order form #2 failed')
      console.log(e)
    }
    console.log('Form #2 finish')
    // 注文フォーム3: 配達時間帯・支払い方法
    // セレクトボックスのname属性にtimestampか何かがついてくる模様なのでセレクタには入れないこと
    const DELIVERY_TIME_SELECTBOX = '#timeAndPay > div > dl.payInfo_tb2.dlvtime > dd > select'
    const PAYMENT_COD_SELECTOR = '#contentsContainer > div > dl > dd > ul > li:nth-child(1) > a'
    const RECEIPT_CHECKBOX = '#contentsContainer > div > div.step2Area01 > table:nth-child(6) > tbody > tr:nth-child(1) > td > label > input'
    const EARLY_DELIVERY_CHECKBOX = '#timeAndPay > div > dl.payInfo_tb2.dlvtime > dd > p > label > input[type="checkbox"]'
    const GO_CONFIRM_BUTTON = '#contentsContainer > div > div.submitArea > ul > li:nth-child(2) > input'
    console.log('Order Form #3: Delivery Time and Payment Method form start')
    try {
      if (DEMO_MODE) demoWait()
      // 処理が面倒な気がするので一括で代引きにしておく
      await page.click(PAYMENT_COD_SELECTOR)
      if (DEMO_MODE) demoWait()
      // 指定時刻
      await page.select(DELIVERY_TIME_SELECTBOX, DELIVERY_TIME);
      if (DEMO_MODE) demoWait()
      // 早め配達が便利なのでONにしておく
      await page.click(EARLY_DELIVERY_CHECKBOX)
      if (DEMO_MODE) demoWait()
      // 領収書有無
      await page.click(RECEIPT_CHECKBOX)
      if (DEMO_MODE) demoWait()
      // 宛名
      await page.evaluate((receipt_name) => {
        const RECEIPT_NAME_SELECTOR = '#contentsContainer > div > div.step2Area01 > table:nth-child(6) > tbody > tr:nth-child(2) > td > input'
        document.querySelector(RECEIPT_NAME_SELECTOR).value = receipt_name }, RECEIPT_NAME)
      if (DEMO_MODE) demoWait()
      page.click(GO_CONFIRM_BUTTON)
      await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
    } catch (e) {
      console.log('Order form #3 failed')
      console.log(e)
    }
    console.log('Order Form #3 finish')
    // 注文フォーム4: 確認画面
    // DEBUGを0, REAL_ORDERをtrueにすると実際に注文されるが、面倒なら手動でもOK
    const CONFIRMED_BUTTON = '#goOrder'
    console.log('Order form #4: Order confirmation form start')
    if (DEBUG === 0 && REAL_ORDER === true) {
      try {
        if (DEMO_MODE) demoWait()
        page.click(CONFIRMED_BUTTON)
        await page.waitForNavigation({timeout: 10000, waitUntil: "domcontentloaded"})
      } catch (e) {
        console.log('Order form #4 failed')
        console.log(e)
      }
    }
    console.log('Order form #4: Order confirmation form start')
    // 記念撮影
    try {
      if (DEMO_MODE) demoWait()
      await page.screenshot({path: 'screenshot/confirm.png', fullPage: true});
    } catch (e) {
      console.log('Capture order result failed')
      console.log(e)
    }
    if (DEMO_MODE) demoWait()
    console.log('Order done!')
    await browser.close();
  }
)

demoWait = () => {
  readlineSync.question('Next');
}
