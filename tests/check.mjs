import assert from "node:assert/strict";
import fs from "node:fs";
const html=fs.readFileSync("index.html","utf8"),css=fs.readFileSync("style.css","utf8"),js=fs.readFileSync("filter.js","utf8");
const jobs=[...html.matchAll(/<article class="job"[^>]*>[\s\S]*?<\/article>/g)].map(x=>x[0]);
assert.equal(jobs.length,11,"Expected 11 verified Saint-Georges jobs");
const ids=[...html.matchAll(/<img[^>]*src="https:\/\/images\.pexels\.com\/photos\/(\d+)/g)].map(x=>x[1]);
assert.equal(ids.length,13,"One hero + 11 vacancies + one team photo");
assert.equal(new Set(ids).size,ids.length,"Do not repeat stock images on the site");
assert.equal(jobs.filter(x=>x.includes('class="job-pay-amount"')).length,9,"Nine official wage ranges");
assert.equal(jobs.filter(x=>x.includes("Зарплата не указана")).length,2,"Two undisclosed salaries");
for(const job of jobs){assert(job.includes("https://www.manac.com/ca/fr/compagnie/carrieres/"),"Every vacancy needs an official source");assert(job.includes('class="job-photo"'),"Every vacancy needs a photo");}
for(const tag of ['rel="canonical"','name="description"','lang="ru"','id="jobSearch"','id="jobStatus"'])assert(html.includes(tag),"Missing HTML requirement "+tag);
for(const asset of ["assets/qx-logo-180.png","assets/qx-favicon-48.png","filter.js","style.css"])assert(fs.existsSync(asset),"Missing standalone resource "+asset);
assert(html.includes("reserout@gmail.com")&&html.includes("info@manac.com"),"Contact emails missing");
assert(html.includes("не официальный сайт Manac")&&html.includes("Все фотографии взяты из Pexels"),"Disclosure required");
assert(html.includes('href="https://qexus.github.io/work.html"'),"Back link to career hub missing");
assert(!html.includes("media.manac.com"),"Original Manac-owned photos must not be used");
assert(!html.includes("../assets/"),"Standalone project cannot depend on root brand files");
assert(!css.includes(".job-pay-amount{margin-top:5px;color:#b7ffe6;font:700 clamp(23px,2.7vw,29px)/1.2 'Space Grotesk',sans-serif;letter-spacing:-.7px;white-space:nowrap}"),"No horizontal salary overflow");
assert(js.includes("aria-pressed")&&js.includes("jobSearch"),"Interactive filters must remain intact");
console.log("Passed: independent Manac assets, photos, salaries, official links, accessibility and basic SEO.");

// Post-migration audit: classify IT technician within the Office & IT filter.
const itCard=jobs.find(job=>job.includes('<h3>Technicien(ne) informatique</h3>'));
assert(itCard && itCard.includes('data-category="office"'),"IT technician must appear under Office & IT");
assert(html.includes('meta name="site-repository" content="qexus/manac"'),"Standalone repository marker must be present");
assert(html.includes('rel="icon"')&&html.includes('assets/qx-favicon-48.png'),"Local favicon must be referenced");
assert(html.includes('https://fonts.googleapis.com/css2?'),"Google Fonts should load without CSS import");
assert(!css.includes("@import url"),"Avoid chained render-blocking CSS font request");
assert(html.includes('width="700" height="420" loading="lazy"'),"Vacancy thumbnails need responsive dimensions");

// Indexable FR/UK editions remain complete and independent of JavaScript translation.
for(const lang of ["fr","uk"]){
 const local=fs.readFileSync(lang+"/index.html","utf8");
 assert(local.includes('<html lang="'+lang+'">'),"Localized Manac HTML lang "+lang);
 assert(local.includes('<link rel="canonical" href="https://qexus.github.io/manac/'+lang+'/">'),"Localized self canonical "+lang);
 assert(local.includes('hreflang="ru"')&&local.includes('hreflang="fr"')&&local.includes('hreflang="uk"'),"Missing alternate links");
 const cards=[...local.matchAll(/<article class="job"[\s\S]*?<\/article>/g)];
 assert.equal(cards.length,11,"Localized Manac needs all 11 jobs");
 assert.equal(cards.filter(c=>c[0].includes('class="job-pay-amount"')).length,9,"Nine official pay rates must be preserved");
 assert(local.includes("reserout@gmail.com")&&local.includes("info@manac.com"),"Both contacts preserved");
 assert(local.includes('href="../style.css"')&&local.includes('src="../filter.js"'),"Assets must work under language subdir");
 assert(local.includes('href="https://qexus.github.io/'+lang+'/work.html"'),"Return to translated career hub");
}
assert(fs.readFileSync("filter.js","utf8").includes('lang==="fr"'),"Job filter count needs French translation");
console.log("Indexable FR/UK Manac jobs, links, images and salary cards validated.");

// Personal recommendation is explicitly free in RU, FR and UK editions.
const feeTexts={
 "index.html":"Помощь с возможной рекомендацией бесплатна",
 "fr/index.html":"mon aide pour une éventuelle recommandation est entièrement gratuite",
 "uk/index.html":"допомога з можливою рекомендацією повністю безплатна"
};
for(const [file,text] of Object.entries(feeTexts)){
 const page=fs.readFileSync(file,"utf8");
 const email=page.indexOf('class="email personal"');
 const fee=page.indexOf('class="referral-fee-note"');
 assert(email>=0&&fee>email&&fee-email<900,"No-fee reassurance must sit immediately after personal address: "+file);
 assert(page.includes(text),"No-fee note missing/incorrect in "+file);
 const emailBlock=page.match(/<a class="email personal" href="([^"]+)"/);
 assert(emailBlock&&emailBlock[1].includes("mailto:reserout@gmail.com")&&emailBlock[1].includes("%0A"),"Localized CV contact link missing "+file);
 assert(page.includes("info@manac.com"),"Official company contact must remain separate");
}
console.log("Free employee referral assistance stated alongside the email in RU/FR/UK.");

// Shared footer keeps country/project identities while preserving every required link.
for(const lang of ['','fr/','uk/']){
 const page=fs.readFileSync(lang+'index.html','utf8');
 assert(page.includes('https://qexus.github.io/shared/qx-footer.css'), 'Shared footer CSS missing in '+lang);
 assert(page.includes('class="qx-footer"')&&page.includes('class="qx-footer__links"'), 'Shared footer structure missing in '+lang);
 assert(page.includes('href="https://www.pexels.com/license/"'), 'Pexels attribution missing in '+lang);
 assert(page.includes('href="https://www.manac.com/ca/fr/compagnie/carrieres"'), 'Manac official-site link missing in '+lang);
 assert(page.includes('href="https://qexus.github.io/'+(lang?lang:'')+'privacy.html"'), 'Localized privacy link missing in '+lang);
}
console.log('Shared RU/FR/UK footer, official employer link, photo credits and privacy links validated.');

// Accessibility + privacy regression: the screen reader name must start with
// the visible call-to-action text, and third-party image requests are anonymous.
for (const [file, visible, aria] of [
  ['index.html','Официальная вакансия','Официальная вакансия Manac:'],
  ['fr/index.html','Offre officielle','Offre officielle Manac :'],
  ['uk/index.html','Офіційна вакансія','Офіційна вакансія Manac:'],
]) {
  const page=fs.readFileSync(file,'utf8');
  const csp=page.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] || '';
  assert(csp.includes("script-src 'self'")&&csp.includes("connect-src 'self'"), 'Manac requires strict same-origin script/network CSP: '+file);
  const anchors=[...page.matchAll(/<a\b[^>]*aria-label="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .filter(m=>m[1].includes('Manac:')||m[1].includes('Manac :'));
  assert.equal(anchors.length,11,'Expected eleven vacancy links with accessible labels: '+file);
  for(const match of anchors) {
    assert(match[1].startsWith(aria),'Accessible name must begin with visible vacancy action: '+file);
    assert(match[2].includes(visible),'Every link must have its visible CTA: '+file);
  }
  const images=[...page.matchAll(/<img\s+src="https:\/\/images\.pexels\.com\/[^"]+"[^>]*>/g)];
  assert.equal(images.length,13,'Missing one of the credited Pexels photos: '+file);
  assert(images.every(m=>m[0].includes('crossorigin="anonymous"')),'Third-party images must not request user credentials: '+file);
  assert(!page.includes('w=1700'),'Oversized hero image request is deprecated: '+file);
}
console.log('Verified accessible vacancy link names, same-origin CSP and anonymous third-party images in three languages.');
