import axios from "axios";


const endpoint = {
  html: "https://{lang}.wikipedia.org/api/rest_v1/page/html/",
  media: "https://{lang}.wikipedia.org/api/rest_v1/page/media/",
  metadata: "https://{lang}.wikipedia.org/api/rest_v1/page/metadata/",
  references: "https://{lang}.wikipedia.org/api/rest_v1/page/references/",
  summary: "https://{lang}.wikipedia.org/api/rest_v1/page/summary/",
  talk_page_html: "https://{lang}.wikipedia.org/api/rest_v1/page/html/%ED%86%A0%EB%A1%A0:"
}

let LANG = "ko";
let BASE_LINK = "";

function getEndPoint(name){
  if(!endpoint[name]){
    throw "not found endpoint name: " + name;
  }
  return endpoint[name].replace('{lang}', getLanguage());
}
// function findTagString(html, tagName){
//   // html = html.replace(/ data-mw='[^']'/g, '');
//   let reg = new RegExp(`<(${tagName})[^>]*>((?:(?!<\\/\\1>).)+)<\\/\\1>`, 'g');
//   let t = html.matchAll(reg);
//   let v, r=[];
//   while((v=t.next()) && !v.done){
//     r.push(v.value);
//   }
//   return r.map(a=>{
//     return {
//       outer: a[0],
//       inner: a[2]
//     }
//   });
// }


export function setLanguage(lang){
  LANG = lang;
}

export function getLanguage(){
  return LANG;
}

export function setBaseLink(url){
  if(typeof url === "function"){
    let fnname = "_" + Date.now() + Math.floor(Math.random()*5);
    BASE_LINK = "javascript:" + fnname;
    window[fnname] = url;
  }else{
    BASE_LINK = url;
  }
}

export function getBaseLink(){
  return BASE_LINK || `https://${getLanguage()}.wikipedia.org/wiki`;
}

function replaceLink(html){
  let base = getBaseLink();
  if(base.indexOf("javascript:") > -1){
    return html.replace(/href=".\/([^"]+)"/g, `href="${base}('$1')"`);
  }else{
    return html.replace(/href=".\//g, `href="${base}/`);
  }
}

export function sections(keyword){
  let url = getEndPoint("html") + encodeURIComponent(keyword);
  return axios.get(url).then(data=>{
    let d = replaceLink(data.data);
    // let d = data.data.replace(/href=".\//g, `href="${getBaseLink()}/`);
    let parser = new DOMParser();
    let doc = parser.parseFromString(d, "text/html");
    doc.querySelectorAll("table, div, figure").forEach(tag=>tag.parentElement.removeChild(tag));
    doc.querySelectorAll("[data-mw]").forEach((tag:any)=>delete tag.dataset.mw);
    return Array.from(doc.querySelectorAll("section"));
  })
}

export function html(keyword){
  return sections(keyword).then(list=>list.map(t=>t.outerHTML).join('\n'));
}

//commons.wikimedia "https://ko.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&iiurlheight=200&iiprop=dimensions%7Curl%7Cmediatype%7Cextmetadata%7Ctimestamp%7Cuser&prop=imageinfo&gsrsearch=%EC%A1%B0%EC%84%A0&iiurlwidth=400&gsroffset=0&gsrlimit=15"
export function images(keyword, option?){
  option = Object.assign({offset:0, limit:15, width:400, height:200}, option||{});
  let url = `https://${getLanguage()}.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&iiurlheight=${option.height}&iiprop=dimensions%7Curl%7Cmediatype%7Cextmetadata%7Ctimestamp%7Cuser&prop=imageinfo&gsrsearch=${encodeURIComponent(keyword)}&iiurlwidth=${option.width}&gsroffset=${option.offset}&gsrlimit=${option.limit}`;
  return axios.get(url).then(data=>{
    let d = data.data;
    return {
      nextOffset: d.continue ? d.continue.gsroffset : 0,
      pages: Object.values(d.query.pages).sort((a:any,b:any)=>a.index-b.index)
    }
  });
}


export function links(keyword, option?){
  option = Object.assign({offset:0, limit:10, thumbsize:80}, option||{});
  // pages가 전체목록이고 redirects에 있는 것들은 pages중 title이 바뀐것(문서이동이라 표현)
  // response
  // {
  //   "batchcomplete": true,
  //   "query": {
  //     "redirects": [{ "index": 2, "from": "사병리", "to": "가조면" }],
  //     //"pages": [{ns: 0, title: "배척", missing: true}] -> 링크가 없는 단어면 이렇게나옴
  //     "pages": [
  //       {
  //         "pageid": 377594,
  //         "ns": 0,
  //         "title": "가조면",
  //         "index": 2,
  //         "contentmodel": "wikitext",
  //         "pagelanguage": "ko",
  //         "pagelanguagehtmlcode": "ko",
  //         "pagelanguagedir": "ltr",
  //         "touched": "2019-12-04T03:45:31Z",
  //         "lastrevid": 24062064,
  //         "length": 3864,
  //         "thumbnail": { "source": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Geochang-map.png/68px-Geochang-map.png", "width": 68, "height": 80 },
  //         "pageimage": "Geochang-map.png",
  //         "description": "대한민국 경상남도 거창군의 면(面) 단위 행정 구역 중 하나",
  //         "descriptionsource": "central"
  //       },
  //       {
  //         "pageid": 430036,
  //         "ns": 0,
  //         "title": "사병",
  //         "index": 1,
  //         "contentmodel": "wikitext",
  //         "pagelanguage": "ko",
  //         "pagelanguagehtmlcode": "ko",
  //         "pagelanguagedir": "ltr",
  //         "touched": "2020-01-30T07:32:59Z",
  //         "lastrevid": 22188593,
  //         "length": 867
  //       }
  //     ]
  //   }
  // }

  let url = `https://${getLanguage()}.wikipedia.org/w/api.php?action=query&format=json&origin=*&formatversion=2&prop=info|pageprops|pageimages|description&generator=prefixsearch&gpssearch=${encodeURIComponent(keyword)}&gpsoffset=${option.offset}&gpslimit=${option.limit}&ppprop=disambiguation&redirects=true&pithumbsize=${option.thumbsize}&pilimit=${option.limit}`;
  return axios.get(url).then(data=>{
    let d = data.data;
    return {
      nextOffset: d.continue ? d.continue.gpsoffset : 0,
      pages: Object.values(d.query.pages).sort((a:any,b:any)=>a.index-b.index),
      redirects: d.query.redirects
    }
  });
}
