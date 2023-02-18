import puppeteer from 'puppeteer';
import readline from 'readline';

async function getUserInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter the check code: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

console.log(puppeteer);

async function getPropertiesFromElementHandle(elementHandle) {
    const Properties = await elementHandle.evaluate(obj => {
        properties = [];

        for (const { name, value } of obj.attributes) {
            console.log(name, value);
            properties.push({ name, value });
        }
        return properties;
    }
    );
    // console.log(Properties);
    return Properties;
}

async function selectElementWithAttribute(page, selectorString, descripsion) {
    let ElementArray = await page.$$(selectorString,
        input => { console.log(input) }
    );
    console.log(selectorString + ' \'s size is ' + ElementArray.length);
    // let isfind = false;
    for (let ele of ElementArray) {
        const properties = await getPropertiesFromElementHandle(ele);
        for (let { key, value } of properties) {
            console.log(value);
            if (value.includes(descripsion)) {
                // isfind = true;
                return ele;
            }
        }
        // if (isfind == true) {
        //     return ele;
        // }
    }
}
async function selectElementWithContent(page, selectorString, descripsion) {
    let ElementArray = await page.$$(selectorString,
        input => { console.log(input) }
    );
    console.log(ElementArray);
    // let isfind = false;
    for (let ele of ElementArray) {
        const innerText = await ele.evaluate(obj => {
            return obj.innerText;
        });
        console.log(innerText);
        if (innerText.includes(descripsion)) {
            return ele;
        };
    }
}



(async () => {
    const browser = await puppeteer.launch({ headless: false, devtools: true, });
    const page = await browser.newPage();
    // viewpoint
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    await page.goto('https://bbs.nga.cn/thread.php?fid=-7');
    await page.waitForSelector('a');

    // await page.type()
    // [href="nuke.php?__lib=login&__act=account&login"]
    const login_in_button = await selectElementWithContent(page, 'a', '登录');
    console.log(login_in_button)
    // await page.click(login_in_button);
    // await login_in_button.click();
    const [response1] = await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        login_in_button.click(), // Clicking the link will indirectly cause a navigation
    ]);
    // await login_in_button.click();
    console.log(page.url())
    // console.log(response)

    // await page.waitForSelector('#main');
    const [iframe] = await page.$x('//iframe');
    console.log(iframe);
    // await frame.waitForLoadState('networkidle');
    const frame = await iframe.contentFrame(); // get the content frame of the iframe
    console.log(frame);
    const use_password_button = await selectElementWithContent(frame, 'a', '使用密码登录');
    console.log(use_password_button);
    await use_password_button.click();

    await frame.waitForSelector('#name');
    await frame.type('#name', '', { delay: 100 });
    await frame.type('#password', '', { delay: 100 });
    const login_button = await selectElementWithContent(frame, 'a', '登 录');
    await login_button.click();

    const verification_code = await selectElementWithAttribute(frame, 'img', 'check_code');
    let url = await verification_code.getProperty('src');
    url = 'https://bbs.nga.cn' + url;
    console.log(url);
    await page.screenshot({ path: 'check_code.png' });
    // https://bbs.nga.cn/login_check_code.php?id=_0.3459208065996695&from=login
    // const value = await getUserInput();
    // console.log(`You entered: ${value}`);

    const confirm_check_code = await selectElementWithAttribute(frame, 'input#name', '输入图形验证码');
    console.log(confirm_check_code);
    // await frame.type('input#name', '555689');
    await confirm_check_code.type('555689', { delay: 100 });
    // await confirm_check_code.press('Enter');

    console.log("wait for confirm")
    page.on('dialog', async dialog => {
        // console.log(dialog.message());
        console.log(dialog);
        await dialog.accept();
    });
    const submit_checkcode_button = await selectElementWithContent(frame, 'a', '继 续');
    const [response2] = await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        submit_checkcode_button.click(), // Clicking the link will indirectly cause a navigation
    ]);
    await page.waitForNavigation();
    await page.goto('https://bbs.nga.cn/thread.php?fid=-7');
    console.log(page.url())
    // jump not implement
    let all_posts = await page.$$('tbody', input => { console.log(input) });
    for (let post of all_posts) {
        console.log(post);
        post.evaluate(input => {
            console.log(input);
        })
    }

    console.log("hello")
    // for (let ele of a) {
    //     console.log(ele);
    //     console.log(await ele.evaluate(input => {
    //         console.log(input);
    //         if (input?.innerText != undefined)
    //             console.log(input.innerText);
    //     }));





    // async getProperty(propertyName) {
    //     return this.evaluateHandle((object, propertyName) => {
    //         return object[propertyName];
    //     }, propertyName);
    // }

    // let ps = await ele.getProperties();

    // for (let key of await p.keys()) {
    //     console.log(key);
    //     let value = await (await ele.getProperty(key).jsonValue());
    //     console.log(`${property}: ${value}`);
    // }
    // for (let [property, value] of await ele.getProperties()) {
    //     console.log(`${property}: ${value}`);
    // }
    // }

    // await page.waitForSelector('
    console.log()

    // // Set screen size
    // await page.setViewport({width: 1080, height: 1024});

    // // Type into search box
    // await page.type('.search-box__input', 'automate beyond recorder');

    // // Wait and click on first result
    // const searchResultSelector = '.search-box__link';
    // await page.waitForSelector(searchResultSelector);
    // await page.click(searchResultSelector);

    // // Locate the full title with a unique string
    // const textSelector = await page.waitForSelector(
    //   'text/Customize and automate'
    // );
    // const fullTitle = await textSelector.evaluate(el => el.textContent);

    // // Print the full title
    // console.log('The title of this blog post is "%s".', fullTitle);

    // await browser.close();
    console.log("end");
})();