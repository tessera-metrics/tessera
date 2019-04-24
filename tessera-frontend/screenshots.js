const { URL }   = require ('url')
const path      = require('path')
const axios     = require('axios')
const puppeteer = require('puppeteer')
const mkdirp    = require('mkdirp');

const outputdir = 'screenshots'
const rooturl   = 'http://localhost:5000'
const viewport  = { width: 1080, height: 1440, isLandscape: false }

// Fetch the list of dashboards from the API, so we can get all the
// URLs for the dashboard pages
async function list_dashboards() {
  return axios.get(rooturl + '/api/dashboard/')
    .then(resp => {
      return resp.data.map(d => rooturl + d.view_href)
    })
    .catch(err => {
      console.log(err)
    });
}

// Navigate to a dashboard and take a screenshot to the output
// directory
async function screenshot(browser, tab, url) {
  console.log('Fetching ' + url)
  await tab.setViewport(viewport)

  var u = new URL(url)
  var name = path.basename(u.pathname)
  u.searchParams.set('mode', 'display')
  await tab.goto(u)

  var outpath = outputdir + '/' + name + '.png'
  console.log('Saving ' + outpath)
  await tab.screenshot({
    fullPage: true,
    path: outpath
  })
}

(async () => {
  mkdirp.sync(outputdir)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [ '--allow-running-insecure-content' ]
  })
  
  var urls = await list_dashboards()
  var tab = await browser.newPage()    
  for (var u of urls) {
    await screenshot(browser, tab, u)
  }
  await browser.close()  
})()
