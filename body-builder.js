(() => {
  "use strict";

  const builder = document.getElementById("bodyBuilder");
  if (!builder) return;

  const svg = document.getElementById("bbSvg");
  const imageUpload = document.getElementById("imageUpload");
  const bodyTab = document.querySelector("[data-body-builder]");
  const status = document.getElementById("bbStatus");

  const bodyDefs = [
    ["height", "Height", 75, 125, 100],
    ["headSize", "Head size", 70, 140, 100],
    ["neckWidth", "Neck width", 60, 150, 100],
    ["shoulders", "Shoulders", 65, 160, 100],
    ["chest", "Chest", 65, 155, 100],
    ["stomach", "Stomach", 60, 170, 100],
    ["waist", "Waist", 55, 160, 100],
    ["hips", "Hips", 60, 165, 100],
    ["armLength", "Arm length", 75, 130, 100],
    ["armWidth", "Arm thickness", 55, 170, 100],
    ["legLength", "Leg length", 75, 135, 100],
    ["thighs", "Thighs", 55, 175, 100],
    ["calves", "Calves", 55, 165, 100],
    ["hands", "Hand size", 65, 150, 100],
    ["feet", "Foot size", 65, 155, 100]
  ];

  const faceDefs = [
    ["faceWidth", "Face width", 70, 140, 100],
    ["forehead", "Forehead", 70, 145, 100],
    ["jaw", "Jaw width", 60, 150, 100],
    ["chin", "Chin length", 65, 150, 100],
    ["eyeSize", "Eye size", 55, 175, 100],
    ["eyeSpacing", "Eye spacing", 65, 145, 100],
    ["eyeHeight", "Eye placement", 70, 135, 100],
    ["browSize", "Eyebrows", 55, 170, 100],
    ["noseSize", "Nose size", 55, 165, 100],
    ["mouthWidth", "Mouth width", 55, 170, 100],
    ["lipSize", "Lip fullness", 45, 190, 100],
    ["earSize", "Ear size", 55, 170, 100]
  ];

  const defaults = Object.fromEntries([...bodyDefs, ...faceDefs].map(([key,,,value]) => [key, value]));
  const values = {...defaults};

  const presets = {
    thin:     {shoulders:82,chest:78,stomach:72,waist:72,hips:82,armWidth:70,thighs:72,calves:72},
    athletic: {shoulders:112,chest:108,stomach:92,waist:86,hips:100,armWidth:105,thighs:108,calves:105},
    average:  {shoulders:100,chest:100,stomach:100,waist:100,hips:100,armWidth:100,thighs:100,calves:100},
    muscular: {shoulders:138,chest:138,stomach:105,waist:88,hips:108,armWidth:145,thighs:142,calves:132},
    chunky:   {shoulders:116,chest:124,stomach:138,waist:130,hips:128,armWidth:125,thighs:128,calves:118},
    plump:    {shoulders:110,chest:126,stomach:158,waist:148,hips:148,armWidth:132,thighs:145,calves:125},
    stylized: {height:112,headSize:128,shoulders:88,chest:82,stomach:74,waist:68,hips:112,armLength:118,legLength:126}
  };

  function makeControls(containerId, defs) {
    const container = document.getElementById(containerId);
    defs.forEach(([key,label,min,max,value]) => {
      const row = document.createElement("label");
      row.className = "bb-range-row";
      row.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" value="${value}" data-bb="${key}"><output>${value}</output>`;
      const input = row.querySelector("input");
      input.addEventListener("input", () => {
        values[key] = Number(input.value);
        row.querySelector("output").value = input.value;
        render();
      });
      container.appendChild(row);
    });
  }

  makeControls("bbBodyControls", bodyDefs);
  makeControls("bbFaceControls", faceDefs);

  const $ = id => document.getElementById(id);
  const get = id => $(id)?.value;
  const checked = id => Boolean($(id)?.checked);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function syncSliders() {
    document.querySelectorAll("[data-bb]").forEach(input => {
      input.value = values[input.dataset.bb];
      input.closest(".bb-range-row").querySelector("output").value = input.value;
    });
  }

  function applyPreset(name) {
    Object.assign(values, defaults, presets[name] || {});
    syncSliders();
    render();
  }

  function ellipse(cx,cy,rx,ry,fill,extra="") {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${Math.max(1,rx)}" ry="${Math.max(1,ry)}" fill="${fill}" ${extra}/>`;
  }

  function render() {
    const base = get("bbBase");
    const presentation = get("bbPresentation");
    const body = get("bbBodyColor");
    const eye = get("bbEyeColor");
    const lip = get("bbLipColor");
    const H = values.height / 100;
    const headScale = values.headSize / 100;
    const center = 250;
    const headY = 102;
    const headRx = 52 * headScale * (values.faceWidth / 100);
    let headRy = 67 * headScale;

    const shape = get("bbHeadShape");
    if (shape === "round") headRy *= .82;
    if (shape === "long") headRy *= 1.18;
    if (shape === "wide") headRx *= 1.18;
    if (shape === "square") headRy *= .96;

    const neckW = 27 * values.neckWidth / 100;
    const shoulderW = 104 * values.shoulders / 100;
    const chestW = 83 * values.chest / 100;
    const stomachW = 72 * values.stomach / 100;
    const waistW = 62 * values.waist / 100;
    const hipW = 77 * values.hips / 100;
    const torsoTop = 183;
    const torsoBottom = 415;
    const armLen = 235 * values.armLength / 100 * H;
    const armW = 27 * values.armWidth / 100;
    const legLen = 272 * values.legLength / 100 * H;
    const thighW = 36 * values.thighs / 100;
    const calfW = 26 * values.calves / 100;
    const handR = 18 * values.hands / 100;
    const footW = 42 * values.feet / 100;
    const eyeSize = 10 * values.eyeSize / 100;
    const eyeGap = 25 * values.eyeSpacing / 100;
    const eyeY = headY + 4 * values.eyeHeight / 100;
    const browW = 18 * values.browSize / 100;
    const nose = 16 * values.noseSize / 100;
    const mouthW = 28 * values.mouthWidth / 100;
    const lipSize = 3.5 * values.lipSize / 100;
    const earR = 14 * values.earSize / 100;
    const jaw = values.jaw / 100;
    const chin = values.chin / 100;
    const stroke = "#2a2430";

    const torsoPath = `
      M ${center-shoulderW} ${torsoTop+18}
      Q ${center-chestW} ${torsoTop+58} ${center-stomachW} ${torsoTop+128}
      Q ${center-waistW} ${torsoTop+188} ${center-hipW} ${torsoBottom}
      Q ${center} ${torsoBottom+28} ${center+hipW} ${torsoBottom}
      Q ${center+waistW} ${torsoTop+188} ${center+stomachW} ${torsoTop+128}
      Q ${center+chestW} ${torsoTop+58} ${center+shoulderW} ${torsoTop+18}
      Q ${center} ${torsoTop-8} ${center-shoulderW} ${torsoTop+18} Z`;

    let specials = "";
    if (checked("bbHorns")) specials += `<path d="M205 62 Q180 12 214 28 M295 62 Q320 12 286 28" fill="none" stroke="${stroke}" stroke-width="13" stroke-linecap="round"/>`;
    if (checked("bbEars")) specials += `<path d="M${center-headRx+2} ${headY-8} L${center-headRx-34} ${headY-32} L${center-headRx+1} ${headY+20} Z M${center+headRx-2} ${headY-8} L${center+headRx+34} ${headY-32} L${center+headRx-1} ${headY+20} Z" fill="${body}" stroke="${stroke}" stroke-width="4"/>`;
    if (checked("bbAntennae")) specials += `<path d="M230 43 Q202 4 190 18 M270 43 Q298 4 310 18" fill="none" stroke="${stroke}" stroke-width="5"/><circle cx="190" cy="18" r="8" fill="${eye}"/><circle cx="310" cy="18" r="8" fill="${eye}"/>`;
    if (checked("bbTail")) specials += `<path d="M${center+hipW-8} ${torsoBottom-6} Q420 470 402 570 Q390 620 430 633" fill="none" stroke="${body}" stroke-width="28" stroke-linecap="round"/>`;
    if (checked("bbLeaves") || base === "plant") specials += `<g fill="#59b86a" stroke="#245a35" stroke-width="3"><ellipse cx="188" cy="71" rx="18" ry="35" transform="rotate(-38 188 71)"/><ellipse cx="312" cy="71" rx="18" ry="35" transform="rotate(38 312 71)"/><ellipse cx="250" cy="31" rx="17" ry="34"/></g>`;

    const baseExtras = {
      animal: `<path d="M214 52 L192 15 L232 41 Z M286 52 L308 15 L268 41 Z" fill="${body}" stroke="${stroke}" stroke-width="4"/>`,
      fruit: `<path d="M250 41 Q248 13 269 6" fill="none" stroke="#5d3b28" stroke-width="10" stroke-linecap="round"/><ellipse cx="279" cy="18" rx="23" ry="12" fill="#55a95c" transform="rotate(-20 279 18)"/>`,
      robot: `<rect x="${center-headRx}" y="${headY-headRy}" width="${headRx*2}" height="${headRy*2}" rx="16" fill="${body}" stroke="${stroke}" stroke-width="5"/>`,
      alien: `<ellipse cx="${center}" cy="${headY}" rx="${headRx*1.15}" ry="${headRy*1.1}" fill="${body}" stroke="${stroke}" stroke-width="5"/>`,
      monster: `<path d="M205 58 Q185 22 215 30 M295 58 Q315 22 285 30" fill="none" stroke="${stroke}" stroke-width="10"/>`
    };

    const regularHead = `<path d="
      M ${center-headRx} ${headY-22}
      Q ${center-headRx*1.03} ${headY+32} ${center-headRx*jaw} ${headY+50}
      Q ${center} ${headY+headRy*chin} ${center+headRx*jaw} ${headY+50}
      Q ${center+headRx*1.03} ${headY+32} ${center+headRx} ${headY-22}
      Q ${center} ${headY-headRy} ${center-headRx} ${headY-22} Z"
      fill="${body}" stroke="${stroke}" stroke-width="5"/>`;

    let eyes = `
      ${ellipse(center-eyeGap,eyeY,eyeSize*1.25,eyeSize*.76,"#f8f8f4",`stroke="${stroke}" stroke-width="3"`)}
      ${ellipse(center+eyeGap,eyeY,eyeSize*1.25,eyeSize*.76,"#f8f8f4",`stroke="${stroke}" stroke-width="3"`)}
      ${ellipse(center-eyeGap,eyeY,eyeSize*.52,eyeSize*.52,eye)}
      ${ellipse(center+eyeGap,eyeY,eyeSize*.52,eyeSize*.52,eye)}
      ${ellipse(center-eyeGap,eyeY,eyeSize*.19,eyeSize*.19,"#111")}
      ${ellipse(center+eyeGap,eyeY,eyeSize*.19,eyeSize*.19,"#111")}
      <path d="M${center-eyeGap-browW/2} ${eyeY-17} Q${center-eyeGap} ${eyeY-23} ${center-eyeGap+browW/2} ${eyeY-18}
               M${center+eyeGap-browW/2} ${eyeY-18} Q${center+eyeGap} ${eyeY-23} ${center+eyeGap+browW/2} ${eyeY-17}"
            fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/>`;

    if (checked("bbExtraEyes")) {
      eyes += `${ellipse(center-eyeGap*.55,eyeY-31,eyeSize*.76,eyeSize*.46,"#f8f8f4",`stroke="${stroke}" stroke-width="2"`)}
               ${ellipse(center+eyeGap*.55,eyeY-31,eyeSize*.76,eyeSize*.46,"#f8f8f4",`stroke="${stroke}" stroke-width="2"`)}
               ${ellipse(center-eyeGap*.55,eyeY-31,eyeSize*.25,eyeSize*.25,eye)}
               ${ellipse(center+eyeGap*.55,eyeY-31,eyeSize*.25,eyeSize*.25,eye)}`;
    }

    const mouthShape = get("bbMouthShape");
    const mouthCurve = mouthShape === "smile" ? 12 : mouthShape === "frown" ? -10 : 0;
    const mouthScale = mouthShape === "wide" ? 1.35 : mouthShape === "small" ? .7 : 1;

    svg.innerHTML = `
      <defs>
        <linearGradient id="bodyShade" x1="0" x2="1">
          <stop offset="0" stop-color="${esc(body)}"/>
          <stop offset=".55" stop-color="${esc(body)}"/>
          <stop offset="1" stop-color="#000" stop-opacity=".18"/>
        </linearGradient>
      </defs>
      <g stroke-linejoin="round">
        ${specials}
        ${baseExtras[base] || ""}
        <rect x="${center-neckW}" y="${headY+48}" width="${neckW*2}" height="74" rx="${neckW*.55}" fill="${body}" stroke="${stroke}" stroke-width="5"/>
        <path d="${torsoPath}" fill="url(#bodyShade)" stroke="${stroke}" stroke-width="6"/>

        <path d="M${center-shoulderW+10} ${torsoTop+28} Q${center-shoulderW-35} ${torsoTop+95} ${center-shoulderW-45} ${torsoTop+armLen}"
              fill="none" stroke="${stroke}" stroke-width="${armW+8}" stroke-linecap="round"/>
        <path d="M${center-shoulderW+10} ${torsoTop+28} Q${center-shoulderW-35} ${torsoTop+95} ${center-shoulderW-45} ${torsoTop+armLen}"
              fill="none" stroke="${body}" stroke-width="${armW}" stroke-linecap="round"/>
        <path d="M${center+shoulderW-10} ${torsoTop+28} Q${center+shoulderW+35} ${torsoTop+95} ${center+shoulderW+45} ${torsoTop+armLen}"
              fill="none" stroke="${stroke}" stroke-width="${armW+8}" stroke-linecap="round"/>
        <path d="M${center+shoulderW-10} ${torsoTop+28} Q${center+shoulderW+35} ${torsoTop+95} ${center+shoulderW+45} ${torsoTop+armLen}"
              fill="none" stroke="${body}" stroke-width="${armW}" stroke-linecap="round"/>
        ${ellipse(center-shoulderW-45,torsoTop+armLen+7,handR*.72,handR,body,`stroke="${stroke}" stroke-width="4"`)}
        ${ellipse(center+shoulderW+45,torsoTop+armLen+7,handR*.72,handR,body,`stroke="${stroke}" stroke-width="4"`)}

        <path d="M${center-hipW*.48} ${torsoBottom-3} Q${center-hipW*.68} ${torsoBottom+legLen*.47} ${center-hipW*.48} ${torsoBottom+legLen}"
              fill="none" stroke="${stroke}" stroke-width="${thighW+9}" stroke-linecap="round"/>
        <path d="M${center-hipW*.48} ${torsoBottom-3} Q${center-hipW*.68} ${torsoBottom+legLen*.47} ${center-hipW*.48} ${torsoBottom+legLen}"
              fill="none" stroke="${body}" stroke-width="${Math.max(calfW,thighW*.78)}" stroke-linecap="round"/>
        <path d="M${center+hipW*.48} ${torsoBottom-3} Q${center+hipW*.68} ${torsoBottom+legLen*.47} ${center+hipW*.48} ${torsoBottom+legLen}"
              fill="none" stroke="${stroke}" stroke-width="${thighW+9}" stroke-linecap="round"/>
        <path d="M${center+hipW*.48} ${torsoBottom-3} Q${center+hipW*.68} ${torsoBottom+legLen*.47} ${center+hipW*.48} ${torsoBottom+legLen}"
              fill="none" stroke="${body}" stroke-width="${Math.max(calfW,thighW*.78)}" stroke-linecap="round"/>
        <path d="M${center-hipW*.48-footW*.45} ${torsoBottom+legLen+5} Q${center-hipW*.48} ${torsoBottom+legLen-10} ${center-hipW*.48+footW} ${torsoBottom+legLen+10}"
              fill="none" stroke="${stroke}" stroke-width="22" stroke-linecap="round"/>
        <path d="M${center+hipW*.48-footW*.45} ${torsoBottom+legLen+5} Q${center+hipW*.48} ${torsoBottom+legLen-10} ${center+hipW*.48+footW} ${torsoBottom+legLen+10}"
              fill="none" stroke="${stroke}" stroke-width="22" stroke-linecap="round"/>

        ${base === "robot" ? "" : regularHead}
        ${ellipse(center-headRx-2,headY+2,earR*.65,earR,body,`stroke="${stroke}" stroke-width="3"`)}
        ${ellipse(center+headRx+2,headY+2,earR*.65,earR,body,`stroke="${stroke}" stroke-width="3"`)}
        ${eyes}
        <path d="M${center} ${eyeY+8} Q${center-nose*.42} ${eyeY+28} ${center+nose*.2} ${eyeY+34}" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
        <path d="M${center-mouthW*mouthScale} ${eyeY+58} Q${center} ${eyeY+58+mouthCurve} ${center+mouthW*mouthScale} ${eyeY+58}"
              fill="none" stroke="${lip}" stroke-width="${lipSize*2}" stroke-linecap="round"/>
      </g>`;

    status.textContent = `${get("bbPreset")} ${base} · ${presentation}`;
  }


  // Keep the editor clean: only one control category stays open at a time.
  document.querySelectorAll(".bb-scroll details").forEach(section => {
    section.addEventListener("toggle", () => {
      if (!section.open) return;
      document.querySelectorAll(".bb-scroll details").forEach(other => {
        if (other !== section) other.open = false;
      });
    });
  });

  function openBuilder() {
    builder.classList.remove("hidden");
    document.querySelectorAll(".stage-tabs button").forEach(b => b.classList.remove("active"));
    bodyTab.classList.add("active");
  }

  function closeBuilder() {
    builder.classList.add("hidden");
    bodyTab.classList.remove("active");
    document.querySelector('[data-workspace="outfit"]')?.classList.add("active");
  }

  bodyTab.addEventListener("click", openBuilder);
  $("bbClose").addEventListener("click", closeBuilder);

  document.querySelectorAll("[data-workspace]").forEach(button => {
    button.addEventListener("click", () => builder.classList.add("hidden"));
  });

  ["bbBase","bbPresentation","bbHeadShape","bbEyeShape","bbNoseShape","bbMouthShape",
   "bbBodyColor","bbEyeColor","bbLipColor","bbHorns","bbEars","bbTail","bbLeaves","bbAntennae","bbExtraEyes"]
    .forEach(id => $(id)?.addEventListener("input", render));

  $("bbPreset").addEventListener("change", event => applyPreset(event.target.value));

  $("bbReset").addEventListener("click", () => {
    Object.assign(values, defaults);
    $("bbPreset").value = "average";
    $("bbBase").value = "human";
    $("bbPresentation").value = "feminine";
    $("bbHeadShape").value = "oval";
    ["bbHorns","bbEars","bbTail","bbLeaves","bbAntennae","bbExtraEyes"].forEach(id => $(id).checked = false);
    applyPreset("average");
  });

  $("bbRandomize").addEventListener("click", () => {
    [...bodyDefs, ...faceDefs].forEach(([key,,min,max]) => values[key] = Math.round(min + Math.random()*(max-min)));
    const bases = ["human","animal","plant","fruit","robot","alien","monster"];
    $("bbBase").value = bases[Math.floor(Math.random()*bases.length)];
    ["bbHorns","bbEars","bbTail","bbLeaves","bbAntennae","bbExtraEyes"].forEach(id => $(id).checked = Math.random() > .72);
    syncSliders();
    render();
  });

  $("bbApply").addEventListener("click", async () => {
    try {
      const clone = svg.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const xml = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([xml], {type:"image/svg+xml"});
      const url = URL.createObjectURL(blob);
      const image = new Image();

      image.onload = () => {
        const c = document.createElement("canvas");
        c.width = 900;
        c.height = 1100;
        const cx = c.getContext("2d");
        cx.clearRect(0,0,c.width,c.height);
        cx.drawImage(image, 105, 8, 690, 1048);
        URL.revokeObjectURL(url);
        c.toBlob(pngBlob => {
          const file = new File([pngBlob], `body-${Date.now()}.png`, {type:"image/png"});
          const transfer = new DataTransfer();
          transfer.items.add(file);
          imageUpload.files = transfer.files;
          imageUpload.dispatchEvent(new Event("change", {bubbles:true}));
          closeBuilder();
        }, "image/png");
      };
      image.onerror = () => URL.revokeObjectURL(url);
      image.src = url;
    } catch (error) {
      console.error("Could not add body to canvas", error);
    }
  });

  applyPreset("average");
  openBuilder();
})();