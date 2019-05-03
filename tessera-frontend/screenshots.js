// -*- mode:javascript -*-

const { URL }   = require ('url')
const path      = require('path')
const axios     = require('axios')
const puppeteer = require('puppeteer')
const mkdirp    = require('mkdirp')
const moment    = require('moment')

const outputdir = 'screenshots'
const rooturl   = 'http://localhost:5000'
const defaultViewport  = { width: 1920, height: 1080, isLandscape: true, deviceScaleFactor: 2 }
const GRAPHITE_TIME_FORMAT = 'hh:mm_YYYYMMDD'

function msleep(n) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
  msleep(n*1000);
}

// Fetch the list of dashboards from the API, so we can get all the
// URLs for the dashboard pages
async function list_dashboards(tag) {
  var url = rooturl + '/api/dashboard/'
  if (tag) {
    url += 'tagged/' + tag
  }
  return axios.get(url)
    .then(resp => {
      return resp.data
    })
    .catch(err => {
      console.log(err)
    });
}

// Navigate to a dashboard and take a screenshot to the output
// directory
async function screenshot(browser, dashboard, viewport) {
  var tab   = await browser.newPage()
  var url   = rooturl + dashboard.view_href  + '/embed'
  var u     = new URL(url)  
  var name  = path.basename(dashboard.view_href)
  var day   = moment().utc().startOf('day').subtract(1, 'day')
  var from  = day.clone().hour(13).minute(0)
  var until = day.clone().hour(13).minute(30)
  var theme = 'light'
  
  await tab.setViewport(viewport || defaultViewport)

  u.searchParams.set('theme', 'light')
  u.searchParams.set('from', from.format(GRAPHITE_TIME_FORMAT))
  u.searchParams.set('until', until.format(GRAPHITE_TIME_FORMAT))
  console.log('Fetching ' + u)
  await tab.goto(u)
  await sleep.sleep(1)

  var rootElement = await tab.$('html')
  var boundingBox = await rootElement.boundingBox()
  boundingBox.height += 12
  
  var outpath = outputdir + '/' + dashboard.category + '-' + name + '-' + theme + '.png'
  console.log('Saving ' + outpath)
  await tab.screenshot({
    clip: boundingBox,
    path: outpath
  })
  await tab.close()
}

(async () => {
  mkdirp.sync(outputdir)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [ '--allow-running-insecure-content' ]
  })
  
  var dashboards = await list_dashboards('render-test')
  for (var d of dashboards) {
    await screenshot(browser, d)
  }
  await browser.close()  
})()

