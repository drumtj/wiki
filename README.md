# wiki

[![npm version](https://img.shields.io/npm/v/@drumtj/wiki.svg?style=flat)](https://www.npmjs.com/package/@drumtj/wiki)
[![license](https://img.shields.io/npm/l/@drumtj/wiki.svg)](#)

simple wiki

## Features

* get sections
* get html
* get images
* get links

## Installing

Using npm:

```bash
$ npm install @drumtj/wiki
```

Using cdn:
```html
<script src="https://unpkg.com/@drumtj/wiki@1.0.4/dist/wiki.js"></script>
```

Using ES2015
```js
import * as wiki from '@drumtj/wiki';
```

## How To

```js
wiki.getBaseLink(); // "https://ko.wikipedia.org/wiki"
wiki.setLanguage("en"); //default 'ko'
wiki.getBaseLink(); // "https://en.wikipedia.org/wiki"

// Return Wiki search results with section tags (return Promise)
wiki.sections("orange").then(sections=>console.log(sections));

// Return wiki search results in html (return Promise)
wiki.html("orange").then(html=>console.log(html));

// Set base link address of every 'a' tag in wiki search results
wiki.setBaseLink("http://myserver"); //<a href="http://myserver/orange">...</a>
wiki.setBaseLink("javascript:alert"); //<a href="javascript:alert('orange')">...</a>
wiki.setBaseLink(function(keyword){...}); //<a href="javascript:_5468534384('orange')">...</a>

wiki.links("orange").then(info=>console.log(info));
wiki.links("orange", {offset:0, limit:10, thumbsize:80}).then(info=>console.log(info));
// result data
{
  "nextOffset": 10,
  "redirects":[{index: 2, from: "old title", to: "current title"}],
  "pages": [{
    "pageid": 4984440,
    "ns": 0,
    "title": "Orange (fruit)",
    "index": 3,
    "contentmodel": "wikitext",
    "pagelanguage": "en",
    "pagelanguagehtmlcode": "en",
    "pagelanguagedir": "ltr",
    "touched": "2020-02-02T09:19:05Z",
    "lastrevid": 937048794,
    "length": 76886,
    "thumbnail": {
      "source": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Orange-Whole-%26-Split.jpg/80px-Orange-Whole-%26-Split.jpg",
      "width": 80,
      "height": 42
    },
    "pageimage": "Orange-Whole-&-Split.jpg",
    "description": "Citrus fruit",
    "descriptionsource": "local"
  }]
}


wiki.images("orange").then(info=>console.log(info));
wiki.images("orange", {offset:0, limit:15, width:400, height:200}).then(info=>console.log(info));
// result data
{
  "nextOffset": 15,
  "pages":[{
    "ns": 6,
    "title": "File:Orange juice 1 edit1.jpg",
    "missing": "",
    "known": "",
    "index": 1,
    "imagerepository": "shared",
    "imageinfo": [{
      "timestamp": "2007-06-03T14:43:13Z",
      "user": "Arad",
      "size": 816217,
      "width": 1566,
      "height": 2226,
      "thumburl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Orange_juice_1_edit1.jpg/141px-Orange_juice_1_edit1.jpg",
      "thumbwidth": 141,
      "thumbheight": 200,
      "url": "https://upload.wikimedia.org/wikipedia/commons/6/67/Orange_juice_1_edit1.jpg",
      "descriptionurl": "https://commons.wikimedia.org/wiki/File:Orange_juice_1_edit1.jpg",
      "descriptionshorturl": "https://commons.wikimedia.org/w/index.php?curid=2196348",
      "extmetadata": {
        "DateTime": {
          "value": "2007-06-03 14:43:13",
          "source": "mediawiki-metadata",
          "hidden": ""
        },
        "ObjectName": {
          "value": "Orange juice 1 edit1",
          "source": "mediawiki-metadata",
          "hidden": ""
        },
        "CommonsMetadataExtension": {
          "value": 1.2,
          "source": "extension",
          "hidden": ""
        },
        "Categories": {
          "value": "Beverages pouring|Featured pictures from the United States Government|Graphic Lab-fr|Orange juice|PD-retouched-user|PD USDA ARS",
          "source": "commons-categories",
          "hidden": ""
        },
        "Assessments": {
          "value": "featured|poty|potd",
          "source": "commons-categories",
          "hidden": ""
        },
        "ImageDescription": {
          "value": "A glass of <a href=\"https://en.wikipedia.org/wiki/Orange_juice\" class=\"extiw\" title=\"en:Orange juice\">Orange juice</a>.",
          "source": "commons-desc-page"
        },
        "Credit": {
          "value": "<a rel=\"nofollow\" class=\"external text\" href=\"http://www.ars.usda.gov/Research/Research.htm?modecode=66-21-00-00\">USDA</a>",
          "source": "commons-desc-page",
          "hidden": ""
        },
        "Artist": {
          "value": "Agency of the United States Department of Agriculture",
          "source": "commons-desc-page"
        },
        "LicenseShortName": {
          "value": "Public domain",
          "source": "commons-desc-page",
          "hidden": ""
        },
        "UsageTerms": {
          "value": "Public domain",
          "source": "commons-desc-page",
          "hidden": ""
        },
        "AttributionRequired": {
          "value": "false",
          "source": "commons-desc-page",
          "hidden": ""
        },
        "Copyrighted": {
          "value": "False",
          "source": "commons-desc-page",
          "hidden": ""
        },
        "Restrictions": {
          "value": "",
          "source": "commons-desc-page",
          "hidden": ""
        },
        "License": {
          "value": "pd",
          "source": "commons-templates",
          "hidden": ""
        }
      },
      "mediatype": "BITMAP"
    }]
  }]
}
```

## examples

### html rendering into wiki search result (0)
```js
async function search(keyword){
  (await wiki.sections(keyword)).forEach(tag=>document.body.appendChild(tag))
}
search("조선");
```

### html rendering into wiki search result (1)
```js
wiki.setLanguage("en");
wiki.setBaseLink("javascript:alert");
async function search(keyword){
  (await wiki.sections(keyword)).forEach(tag=>document.body.appendChild(tag))
}
search("joseon");
```

### html rendering into wiki search result (2)
```js
let container = document.createElement("div");
document.body.appendChild(container);

wiki.setBaseLink("javascript:search");
function search(keyword){  
  wiki.sections(keyword)
  .then(sections=>{
    container.innerHTML = "";
    sections.forEach(tag=>container.appendChild(tag))
  })
  .catch(e=>{
    alert("not found link");
    console.error(e);
  })
}
search("조선");
```

### html rendering into wiki search result (3)
```js
let container = document.createElement("div");
document.body.appendChild(container);

wiki.setBaseLink(search);
function search(keyword){  
  wiki.sections(keyword)
  .then(sections=>{
    container.innerHTML = "";
    sections.forEach(tag=>container.appendChild(tag))
  })
  .catch(e=>{
    alert("not found link");
    console.error(e);
  })
}
search("조선");
```

### find images
```js
let input = document.createElement("input");
let searchButton = document.createElement("button");
let moreButton = document.createElement("button");
let container = document.createElement("div");
let offset = 0;
searchButton.textContent = "search";
moreButton.textContent = "more";
container.style.cssText = "width:1200px;height:500px;overflow-y:auto;border:1px solid;";
document.body.appendChild(input);
document.body.appendChild(searchButton);
document.body.appendChild(moreButton);
document.body.appendChild(container);
searchButton.onclick = e=>{
    clear();    
    searchImage(input.value);
}
moreButton.onclick = e=>{
  searchImage(input.value);
}
function clear(){
  offset = 0;
  container.innerHTML = "";
}
function searchImage(keyword){
  if(!input.value) return;
  searchButton.disabled = true;
  moreButton.disabled = true;
  wiki.images(input.value, {offset}).then(info=>{
      offset = info.nextOffset;
      info.pages.forEach(page=>{
        let data = page.imageinfo[0];
        let img = new Image();
        img.title = page.title;
        img.src = data.thumburl;
        img.width = data.thumbwidth;
        img.height = data.thumbheight;
        container.appendChild(img);
      })
      searchButton.disabled = false;
      moreButton.disabled = false;
  })
}
```

### find links
```js
let input = document.createElement("input");
let searchButton = document.createElement("button");
let moreButton = document.createElement("button");
let container = document.createElement("div");
let offset = 0;
searchButton.textContent = "search";
moreButton.textContent = "more";
container.style.cssText = "width:500px;height:500px;overflow-y:auto;border:1px solid;";
document.body.appendChild(input);
document.body.appendChild(searchButton);
document.body.appendChild(moreButton);
document.body.appendChild(container);
searchButton.onclick = e=>{
    clear();    
    searchLink(input.value);
}
moreButton.onclick = e=>{
  searchLink(input.value);
}
function clear(){
  offset = 0;
  container.innerHTML = "";
}
function searchLink(keyword){
  if(!input.value) return;
  searchButton.disabled = true;
  moreButton.disabled = true;
  wiki.links(input.value, {offset}).then(info=>{
      offset = info.nextOffset;
      info.pages.forEach(page=>{
        let row = document.createElement("a");
        row.style.cssText = "display:block;height:80px;border-bottom:1px solid";
        row.href = "https://ko.wikipedia.org/wiki/" + page.title.replace(/ /g, '_');
        row.target = "_blank";

        if(page.thumbnail){
          let img = new Image();
          img.src = page.thumbnail.source;
          img.width = page.thumbnail.width;
          img.height = page.thumbnail.height;
          img.style.float = "left";
          row.appendChild(img);
        }

        let title = document.createElement("div");
        title.textContent = page.title;
        let desc = document.createElement("div");
        desc.textContent = page.description;

        row.appendChild(title);
        row.appendChild(desc);
        container.appendChild(row);
      })
      searchButton.disabled = false;
      moreButton.disabled = false;
  })
}
```

## License

MIT
