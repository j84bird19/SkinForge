(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const builder = $("bodyBuilder");
  if (!builder) return;

  const svg = $("bbSvg");
  const imageUpload = $("imageUpload");
  const nav = $("bbCategoryNav");
  const tiles = $("bbOptionTiles");
  const sliders = $("bbSliderPanel");
  const panelTitle = $("bbPanelTitle");
  const panelHint = $("bbPanelHint");
  const status = $("bbStatus");
  const bodyTab = document.querySelector("[data-body-builder]");
  const topTabs = [...document.querySelectorAll("[data-bb-tab]")];

  const normalValues = {
    height:100, headSize:100, neckWidth:100, shoulders:100, chest:100, stomach:100,
    waist:100, hips:100, armLength:100, armWidth:100, legLength:100, thighs:100,
    calves:100, hands:100, feet:100, faceWidth:100, forehead:100, jaw:100, chin:100,
    eyeSize:100, eyeSpacing:100, eyeHeight:100, browSize:100, noseSize:100,
    mouthWidth:100, lipSize:100, earSize:100
  };

  const state = {
    tab:"body",
    category:"base",
    base:"human",
    presentation:"feminine",
    preset:"average",
    headShape:"oval",
    eyeShape:"almond",
    noseShape:"straight",
    mouthShape:"neutral",
    skin:"#d79a7b",
    eyes:"#62d7ff",
    lips:"#b94f67",
    horns:false, ears:false, tail:false, leaves:false, antennae:false, extraEyes:false,
    values:{...normalValues}
  };

  const presets = {
    thin:{shoulders:84,chest:80,stomach:76,waist:74,hips:84,armWidth:72,thighs:74,calves:74},
    athletic:{shoulders:112,chest:108,stomach:92,waist:88,hips:100,armWidth:108,thighs:110,calves:106},
    average:{},
    muscular:{shoulders:136,chest:138,stomach:104,waist:90,hips:108,armWidth:145,thighs:140,calves:132},
    chunky:{shoulders:116,chest:122,stomach:136,waist:128,hips:130,armWidth:126,thighs:130,calves:118},
    plump:{shoulders:110,chest:126,stomach:154,waist:146,hips:146,armWidth:132,thighs:144,calves:124},
    stylized:{height:110,headSize:124,shoulders:90,chest:84,stomach:78,waist:72,hips:110,armLength:116,legLength:122}
  };

  const bodySliders = [
    ["height","Height",75,125],["headSize","Head size",70,140],["neckWidth","Neck width",60,150],
    ["shoulders","Shoulders",65,160],["chest","Chest",65,155],["stomach","Stomach",60,170],
    ["waist","Waist",55,160],["hips","Hips",60,165],["armLength","Arm length",75,130],
    ["armWidth","Arm thickness",55,170],["legLength","Leg length",75,135],["thighs","Thighs",55,175],
    ["calves","Calves",55,165],["hands","Hand size",65,150],["feet","Foot size",65,155]
  ];

  const faceSliders = [
    ["faceWidth","Face width",70,140],["forehead","Forehead",70,145],["jaw","Jaw width",60,150],
    ["chin","Chin length",65,150],["eyeSize","Eye size",55,175],["eyeSpacing","Eye spacing",65,145],
    ["eyeHeight","Eye placement",70,135],["browSize","Eyebrows",55,170],["noseSize","Nose size",55,165],
    ["mouthWidth","Mouth width",55,170],["lipSize","Lip fullness",45,190],["earSize","Ear size",55,170]
  ];

  const ui = {
    body:{
      base:{title:"Character Base",hint:"Choose a starting form",icon:"◉",options:[
        ["human","Human","🧍"],["animal","Animal","🐾"],["plant","Plant","🌿"],["fruit","Fruit / Food","🍎"],
        ["robot","Robot","🤖"],["alien","Alien","👽"],["monster","Monster","👹"],["custom","Custom","✦"]
      ]},
      presentation:{title:"Presentation",hint:"Choose the overall character read",icon:"◇",options:[
        ["feminine","Feminine","♀"],["masculine","Masculine","♂"],["androgynous","Androgynous","⚥"],["neutral","Neutral","○"]
      ]},
      build:{title:"Body Build",hint:"Start from normal proportions, then refine",icon:"↔",options:[
        ["thin","Thin","│"],["athletic","Athletic","◆"],["average","Average","●"],["muscular","Muscular","⬟"],
        ["chunky","Chunky","⬢"],["plump","Plump","◉"],["stylized","Stylized","✦"]
      ]},
      proportions:{title:"Body Proportions",hint:"Adjust the selected body measurements",icon:"☷",sliders:bodySliders}
    },
    face:{
      faceShape:{title:"Face Shape",hint:"Choose the closest starting shape",icon:"◯",options:[
        ["oval","Oval","⬭"],["round","Round","●"],["square","Square","■"],["heart","Heart","♥"],
        ["diamond","Diamond","◆"],["long","Long","▯"],["wide","Wide","▬"]
      ]},
      eyes:{title:"Eyes",hint:"Choose shape, size and placement",icon:"◉",options:[
        ["almond","Almond","◒"],["round","Round","●"],["narrow","Narrow","—"],["upturned","Upturned","⌃"],["downturned","Downturned","⌄"]
      ],sliders:faceSliders.filter(d=>["eyeSize","eyeSpacing","eyeHeight"].includes(d[0]))},
      brows:{title:"Eyebrows",hint:"Adjust eyebrow weight",icon:"⌁",sliders:faceSliders.filter(d=>d[0]==="browSize")},
      nose:{title:"Nose",hint:"Choose a nose shape and size",icon:"⌄",options:[
        ["straight","Straight","│"],["button","Button","•"],["wide","Wide","⌒"],["pointed","Pointed","⌄"],["flat","Flat","—"]
      ],sliders:faceSliders.filter(d=>d[0]==="noseSize")},
      mouth:{title:"Mouth & Lips",hint:"Choose expression and proportions",icon:"⌣",options:[
        ["neutral","Neutral","—"],["smile","Smile","⌣"],["frown","Frown","⌢"],["wide","Wide","━"],["small","Small","─"]
      ],sliders:faceSliders.filter(d=>["mouthWidth","lipSize"].includes(d[0]))},
      structure:{title:"Face Structure",hint:"Refine forehead, jaw, chin and ears",icon:"⬡",sliders:faceSliders.filter(d=>["faceWidth","forehead","jaw","chin","earSize"].includes(d[0]))}
    },
    surface:{
      colors:{title:"Colors",hint:"Set body, eye and lip colors",icon:"🎨",colors:true}
    },
    features:{
      extras:{title:"Special Features",hint:"Turn optional features on or off",icon:"✦",toggles:[
        ["horns","Horns / Antlers","♈"],["ears","Pointed / Animal Ears","△"],["tail","Tail","⌁"],
        ["leaves","Leaves / Petals","❧"],["antennae","Antennae","⌇"],["extraEyes","Extra Eyes","◉"]
      ]}
    }
  };

  const tabCategories = {
    body:[["base","Character Base"],["presentation","Presentation"],["build","Body Build"],["proportions","Proportions"]],
    face:[["faceShape","Face Shape"],["eyes","Eyes"],["brows","Eyebrows"],["nose","Nose"],["mouth","Mouth"],["structure","Structure"]],
    surface:[["colors","Colors"]],
    features:[["extras","Special Features"]]
  };

  function config(){ return ui[state.tab][state.category]; }

  function setTab(tab){
    state.tab = tab;
    state.category = tabCategories[tab][0][0];
    topTabs.forEach(b=>b.classList.toggle("active",b.dataset.bbTab===tab));
    renderNav();
    renderPanel();
  }

  function renderNav(){
    nav.innerHTML="";
    tabCategories[state.tab].forEach(([key,label])=>{
      const cfg=ui[state.tab][key];
      const button=document.createElement("button");
      button.className=key===state.category?"active":"";
      button.innerHTML=`<span class="bb-nav-icon">${cfg.icon}</span><span>${label}</span>`;
      button.addEventListener("click",()=>{state.category=key;renderNav();renderPanel();});
      nav.appendChild(button);
    });
  }

  function stateKey(){
    return ({
      base:"base",presentation:"presentation",build:"preset",faceShape:"headShape",
      eyes:"eyeShape",nose:"noseShape",mouth:"mouthShape"
    })[state.category] || null;
  }

  function renderPanel(){
    const cfg=config();
    panelTitle.textContent=cfg.title;
    panelHint.textContent=cfg.hint;
    tiles.innerHTML="";
    sliders.innerHTML="";

    if(cfg.options){
      const key=stateKey();
      cfg.options.forEach(([value,label,visual])=>{
        const button=document.createElement("button");
        button.className=`bb-option-tile ${key && state[key]===value?"active":""}`;
        button.innerHTML=`<span class="bb-option-visual">${visual}</span><span>${label}</span>`;
        button.addEventListener("click",()=>{
          if(key){
            state[key]=value;
            if(key==="preset"){
              state.values={...normalValues,...(presets[value]||{})};
            }
          }
          renderPanel();
          renderCharacter();
        });
        tiles.appendChild(button);
      });
    }

    if(cfg.toggles){
      cfg.toggles.forEach(([key,label,visual])=>{
        const button=document.createElement("button");
        button.className=`bb-option-tile ${state[key]?"active":""}`;
        button.innerHTML=`<span class="bb-option-visual">${visual}</span><span>${label}</span>`;
        button.addEventListener("click",()=>{
          state[key]=!state[key];
          renderPanel();
          renderCharacter();
        });
        tiles.appendChild(button);
      });
    }

    if(cfg.colors){
      sliders.innerHTML=`
        <div class="bb-color-grid">
          <div class="bb-color-card"><label>Body / Skin</label><input type="color" data-color="skin" value="${state.skin}"></div>
          <div class="bb-color-card"><label>Eyes</label><input type="color" data-color="eyes" value="${state.eyes}"></div>
          <div class="bb-color-card"><label>Lips</label><input type="color" data-color="lips" value="${state.lips}"></div>
        </div>`;
      sliders.querySelectorAll("[data-color]").forEach(input=>{
        input.addEventListener("input",()=>{
          state[input.dataset.color]=input.value;
          renderCharacter();
        });
      });
    }

    (cfg.sliders||[]).forEach(([key,label,min,max])=>{
      const row=document.createElement("div");
      row.className="bb-slider-row";
      row.innerHTML=`<label>${label}</label><input type="range" min="${min}" max="${max}" value="${state.values[key]}"><output>${state.values[key]}</output>`;
      const input=row.querySelector("input");
      const output=row.querySelector("output");
      input.addEventListener("input",()=>{
        state.values[key]=Number(input.value);
        output.value=input.value;
        renderCharacter();
      });
      sliders.appendChild(row);
    });
  }

  function ellipse(cx,cy,rx,ry,fill,extra=""){
    return `<ellipse cx="${cx}" cy="${cy}" rx="${Math.max(1,rx)}" ry="${Math.max(1,ry)}" fill="${fill}" ${extra}/>`;
  }

  function renderCharacter(){
    const v=state.values;
    const body=state.skin, eye=state.eyes, lip=state.lips, center=250, stroke="#2a2430";
    const H=v.height/100;
    let headRx=52*(v.headSize/100)*(v.faceWidth/100);
    let headRy=67*(v.headSize/100);
    if(state.headShape==="round") headRy*=.82;
    if(state.headShape==="long") headRy*=1.18;
    if(state.headShape==="wide") headRx*=1.18;
    if(state.headShape==="square") headRy*=.96;

    const headY=102, neckW=27*v.neckWidth/100, shoulderW=104*v.shoulders/100;
    const chestW=83*v.chest/100, stomachW=72*v.stomach/100, waistW=62*v.waist/100;
    const hipW=77*v.hips/100, torsoTop=183, torsoBottom=415;
    const armLen=235*v.armLength/100*H, armW=27*v.armWidth/100;
    const legLen=272*v.legLength/100*H, thighW=36*v.thighs/100, calfW=26*v.calves/100;
    const handR=18*v.hands/100, footW=42*v.feet/100;
    const eyeSize=10*v.eyeSize/100, eyeGap=25*v.eyeSpacing/100, eyeY=headY+4*v.eyeHeight/100;
    const browW=18*v.browSize/100, nose=16*v.noseSize/100;
    const mouthW=28*v.mouthWidth/100, lipSize=3.5*v.lipSize/100;
    const earR=14*v.earSize/100, jaw=v.jaw/100, chin=v.chin/100;

    const torsoPath=`M ${center-shoulderW} ${torsoTop+18}
      Q ${center-chestW} ${torsoTop+58} ${center-stomachW} ${torsoTop+128}
      Q ${center-waistW} ${torsoTop+188} ${center-hipW} ${torsoBottom}
      Q ${center} ${torsoBottom+28} ${center+hipW} ${torsoBottom}
      Q ${center+waistW} ${torsoTop+188} ${center+stomachW} ${torsoTop+128}
      Q ${center+chestW} ${torsoTop+58} ${center+shoulderW} ${torsoTop+18}
      Q ${center} ${torsoTop-8} ${center-shoulderW} ${torsoTop+18} Z`;

    let specials="";
    if(state.horns) specials+=`<path d="M205 62 Q180 12 214 28 M295 62 Q320 12 286 28" fill="none" stroke="${stroke}" stroke-width="13" stroke-linecap="round"/>`;
    if(state.ears) specials+=`<path d="M${center-headRx+2} ${headY-8} L${center-headRx-34} ${headY-32} L${center-headRx+1} ${headY+20} Z M${center+headRx-2} ${headY-8} L${center+headRx+34} ${headY-32} L${center+headRx-1} ${headY+20} Z" fill="${body}" stroke="${stroke}" stroke-width="4"/>`;
    if(state.antennae) specials+=`<path d="M230 43 Q202 4 190 18 M270 43 Q298 4 310 18" fill="none" stroke="${stroke}" stroke-width="5"/><circle cx="190" cy="18" r="8" fill="${eye}"/><circle cx="310" cy="18" r="8" fill="${eye}"/>`;
    if(state.tail) specials+=`<path d="M${center+hipW-8} ${torsoBottom-6} Q420 470 402 570 Q390 620 430 633" fill="none" stroke="${body}" stroke-width="28" stroke-linecap="round"/>`;
    if(state.leaves||state.base==="plant") specials+=`<g fill="#59b86a" stroke="#245a35" stroke-width="3"><ellipse cx="188" cy="71" rx="18" ry="35" transform="rotate(-38 188 71)"/><ellipse cx="312" cy="71" rx="18" ry="35" transform="rotate(38 312 71)"/><ellipse cx="250" cy="31" rx="17" ry="34"/></g>`;

    let baseExtras="";
    if(state.base==="animal") baseExtras=`<path d="M214 52 L192 15 L232 41 Z M286 52 L308 15 L268 41 Z" fill="${body}" stroke="${stroke}" stroke-width="4"/>`;
    if(state.base==="fruit") baseExtras=`<path d="M250 41 Q248 13 269 6" fill="none" stroke="#5d3b28" stroke-width="10" stroke-linecap="round"/><ellipse cx="279" cy="18" rx="23" ry="12" fill="#55a95c" transform="rotate(-20 279 18)"/>`;

    const head=`<path d="M ${center-headRx} ${headY-22}
      Q ${center-headRx*1.03} ${headY+32} ${center-headRx*jaw} ${headY+50}
      Q ${center} ${headY+headRy*chin} ${center+headRx*jaw} ${headY+50}
      Q ${center+headRx*1.03} ${headY+32} ${center+headRx} ${headY-22}
      Q ${center} ${headY-headRy} ${center-headRx} ${headY-22} Z"
      fill="${body}" stroke="${stroke}" stroke-width="5"/>`;

    const mouthCurve=state.mouthShape==="smile"?12:state.mouthShape==="frown"?-10:0;
    const mouthScale=state.mouthShape==="wide"?1.35:state.mouthShape==="small"?.7:1;
    const legStroke=Math.max(calfW,thighW*.78);

    svg.innerHTML=`
      <defs>
        <linearGradient id="bodyShade" x1="0" x2="1">
          <stop offset="0" stop-color="${body}"/>
          <stop offset=".55" stop-color="${body}"/>
          <stop offset="1" stop-color="#000" stop-opacity=".16"/>
        </linearGradient>
      </defs>
      <g stroke-linejoin="round">
        ${specials}${baseExtras}
        <rect x="${center-neckW}" y="${headY+48}" width="${neckW*2}" height="74" rx="${neckW*.55}" fill="${body}" stroke="${stroke}" stroke-width="5"/>
        <path d="${torsoPath}" fill="url(#bodyShade)" stroke="${stroke}" stroke-width="6"/>

        <path d="M${center-shoulderW+10} ${torsoTop+28} Q${center-shoulderW-35} ${torsoTop+95} ${center-shoulderW-45} ${torsoTop+armLen}" fill="none" stroke="${stroke}" stroke-width="${armW+8}" stroke-linecap="round"/>
        <path d="M${center-shoulderW+10} ${torsoTop+28} Q${center-shoulderW-35} ${torsoTop+95} ${center-shoulderW-45} ${torsoTop+armLen}" fill="none" stroke="${body}" stroke-width="${armW}" stroke-linecap="round"/>
        <path d="M${center+shoulderW-10} ${torsoTop+28} Q${center+shoulderW+35} ${torsoTop+95} ${center+shoulderW+45} ${torsoTop+armLen}" fill="none" stroke="${stroke}" stroke-width="${armW+8}" stroke-linecap="round"/>
        <path d="M${center+shoulderW-10} ${torsoTop+28} Q${center+shoulderW+35} ${torsoTop+95} ${center+shoulderW+45} ${torsoTop+armLen}" fill="none" stroke="${body}" stroke-width="${armW}" stroke-linecap="round"/>

        ${ellipse(center-shoulderW-45,torsoTop+armLen+7,handR*.72,handR,body,`stroke="${stroke}" stroke-width="4"`)}
        ${ellipse(center+shoulderW+45,torsoTop+armLen+7,handR*.72,handR,body,`stroke="${stroke}" stroke-width="4"`)}

        <path d="M${center-hipW*.48} ${torsoBottom-3} Q${center-hipW*.68} ${torsoBottom+legLen*.47} ${center-hipW*.48} ${torsoBottom+legLen}" fill="none" stroke="${stroke}" stroke-width="${thighW+9}" stroke-linecap="round"/>
        <path d="M${center-hipW*.48} ${torsoBottom-3} Q${center-hipW*.68} ${torsoBottom+legLen*.47} ${center-hipW*.48} ${torsoBottom+legLen}" fill="none" stroke="${body}" stroke-width="${legStroke}" stroke-linecap="round"/>
        <path d="M${center+hipW*.48} ${torsoBottom-3} Q${center+hipW*.68} ${torsoBottom+legLen*.47} ${center+hipW*.48} ${torsoBottom+legLen}" fill="none" stroke="${stroke}" stroke-width="${thighW+9}" stroke-linecap="round"/>
        <path d="M${center+hipW*.48} ${torsoBottom-3} Q${center+hipW*.68} ${torsoBottom+legLen*.47} ${center+hipW*.48} ${torsoBottom+legLen}" fill="none" stroke="${body}" stroke-width="${legStroke}" stroke-linecap="round"/>

        <path d="M${center-hipW*.48-footW*.45} ${torsoBottom+legLen+5} Q${center-hipW*.48} ${torsoBottom+legLen-10} ${center-hipW*.48+footW} ${torsoBottom+legLen+10}" fill="none" stroke="${stroke}" stroke-width="22" stroke-linecap="round"/>
        <path d="M${center+hipW*.48-footW*.45} ${torsoBottom+legLen+5} Q${center+hipW*.48} ${torsoBottom+legLen-10} ${center+hipW*.48+footW} ${torsoBottom+legLen+10}" fill="none" stroke="${stroke}" stroke-width="22" stroke-linecap="round"/>

        ${head}
        ${ellipse(center-headRx-2,headY+2,earR*.65,earR,body,`stroke="${stroke}" stroke-width="3"`)}
        ${ellipse(center+headRx+2,headY+2,earR*.65,earR,body,`stroke="${stroke}" stroke-width="3"`)}

        ${ellipse(center-eyeGap,eyeY,eyeSize*1.25,eyeSize*.76,"#f8f8f4",`stroke="${stroke}" stroke-width="3"`)}
        ${ellipse(center+eyeGap,eyeY,eyeSize*1.25,eyeSize*.76,"#f8f8f4",`stroke="${stroke}" stroke-width="3"`)}
        ${ellipse(center-eyeGap,eyeY,eyeSize*.52,eyeSize*.52,eye)}
        ${ellipse(center+eyeGap,eyeY,eyeSize*.52,eyeSize*.52,eye)}
        ${ellipse(center-eyeGap,eyeY,eyeSize*.19,eyeSize*.19,"#111")}
        ${ellipse(center+eyeGap,eyeY,eyeSize*.19,eyeSize*.19,"#111")}

        <path d="M${center-eyeGap-browW/2} ${eyeY-17} Q${center-eyeGap} ${eyeY-23} ${center-eyeGap+browW/2} ${eyeY-18}
                 M${center+eyeGap-browW/2} ${eyeY-18} Q${center+eyeGap} ${eyeY-23} ${center+eyeGap+browW/2} ${eyeY-17}"
              fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>

        <path d="M${center} ${eyeY+8} Q${center-nose*.42} ${eyeY+28} ${center+nose*.2} ${eyeY+34}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
        <path d="M${center-mouthW*mouthScale} ${eyeY+58} Q${center} ${eyeY+58+mouthCurve} ${center+mouthW*mouthScale} ${eyeY+58}"
              fill="none" stroke="${lip}" stroke-width="${lipSize*2}" stroke-linecap="round"/>
      </g>`;

    status.textContent=`${state.preset} ${state.base} · ${state.presentation}`;
  }

  function openBuilder(){
    builder.classList.remove("hidden");
    document.querySelectorAll(".stage-tabs button").forEach(b=>b.classList.remove("active"));
    bodyTab?.classList.add("active");
  }

  function closeBuilder(){
    builder.classList.add("hidden");
    bodyTab?.classList.remove("active");
    document.querySelector('[data-workspace="outfit"]')?.classList.add("active");
  }

  topTabs.forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.bbTab)));
  $("bbClose").addEventListener("click",closeBuilder);
  bodyTab?.addEventListener("click",openBuilder);
  document.querySelectorAll("[data-workspace]").forEach(button=>button.addEventListener("click",()=>builder.classList.add("hidden")));

  $("bbReset").addEventListener("click",()=>{
    Object.assign(state,{
      tab:"body",category:"base",base:"human",presentation:"feminine",preset:"average",
      headShape:"oval",eyeShape:"almond",noseShape:"straight",mouthShape:"neutral",
      skin:"#d79a7b",eyes:"#62d7ff",lips:"#b94f67",
      horns:false,ears:false,tail:false,leaves:false,antennae:false,extraEyes:false,
      values:{...normalValues}
    });
    setTab("body");
    renderCharacter();
  });

  $("bbRandomize").addEventListener("click",()=>{
    Object.keys(state.values).forEach(key=>{
      state.values[key]=Math.round(82+Math.random()*36);
    });
    const bases=["human","animal","plant","fruit","robot","alien","monster"];
    state.base=bases[Math.floor(Math.random()*bases.length)];
    ["horns","ears","tail","leaves","antennae","extraEyes"].forEach(key=>state[key]=Math.random()>.76);
    renderPanel();
    renderCharacter();
  });

  $("bbApply").addEventListener("click",()=>{
    const clone=svg.cloneNode(true);
    clone.setAttribute("xmlns","http://www.w3.org/2000/svg");
    const xml=new XMLSerializer().serializeToString(clone);
    const blob=new Blob([xml],{type:"image/svg+xml"});
    const url=URL.createObjectURL(blob);
    const image=new Image();

    image.onload=()=>{
      const c=document.createElement("canvas");
      c.width=900;
      c.height=1100;
      const cx=c.getContext("2d");
      cx.clearRect(0,0,c.width,c.height);
      cx.drawImage(image,105,8,690,1048);
      URL.revokeObjectURL(url);
      c.toBlob((pngBlob)=>{
        const file=new File([pngBlob],`body-${Date.now()}.png`,{type:"image/png"});
        const transfer=new DataTransfer();
        transfer.items.add(file);
        imageUpload.files=transfer.files;
        imageUpload.dispatchEvent(new Event("change",{bubbles:true}));
        closeBuilder();
      },"image/png");
    };
    image.onerror=()=>URL.revokeObjectURL(url);
    image.src=url;
  });

  setTab("body");
  renderCharacter();
  openBuilder();
})();