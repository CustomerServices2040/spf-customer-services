(()=>{
  let governorates={
  "all": {
    "name": "إجمالي المحافظات",
    "staff": 169,
    "phone": "",
    "total": 289725,
    "transactions": 198121,
    "community": 367,
    "field": 31973,
    "proactive": 5012,
    "selfService": 25345,
    "appointments": 101809,
    "whatsapp": 28907,
    "qr": 164978
  },
  "muscat": {
    "name": "مسقط",
    "staff": 30,
    "phone": "92826502",
    "total": 69465,
    "transactions": 58523,
    "community": 12,
    "field": 1360,
    "proactive": 99,
    "selfService": 4348,
    "appointments": 23144,
    "whatsapp": 5123,
    "qr": 30729
  },
  "dhofar": {
    "name": "ظفار",
    "staff": 31,
    "phone": "91411529",
    "total": 30332,
    "transactions": 18323,
    "community": 40,
    "field": 6779,
    "proactive": 1123,
    "selfService": 2393,
    "appointments": 10880,
    "whatsapp": 1674,
    "qr": 18832
  },
  "north_batinah": {
    "name": "شمال الباطنة",
    "staff": 25,
    "phone": "91405009",
    "total": 37219,
    "transactions": 27770,
    "community": 35,
    "field": 5146,
    "proactive": 69,
    "selfService": 3091,
    "appointments": 15402,
    "whatsapp": 1108,
    "qr": 21237
  },
  "south_batinah": {
    "name": "جنوب الباطنة",
    "staff": 16,
    "phone": "97875819",
    "total": 41085,
    "transactions": 22329,
    "community": 58,
    "field": 7977,
    "proactive": 525,
    "selfService": 4666,
    "appointments": 10318,
    "whatsapp": 5530,
    "qr": 25653
  },
  "dakhiliyah": {
    "name": "الداخلية",
    "staff": 13,
    "phone": "98247110",
    "total": 17144,
    "transactions": 12239,
    "community": 32,
    "field": 1972,
    "proactive": 465,
    "selfService": 1075,
    "appointments": 8510,
    "whatsapp": 1361,
    "qr": 10722
  },
  "north_sharqiyah": {
    "name": "شمال الشرقية",
    "staff": 13,
    "phone": "79374268",
    "total": 16199,
    "transactions": 11391,
    "community": 55,
    "field": 1494,
    "proactive": 32,
    "selfService": 832,
    "appointments": 6225,
    "whatsapp": 2395,
    "qr": 8194
  },
  "south_sharqiyah": {
    "name": "جنوب الشرقية",
    "staff": 10,
    "phone": "98064862",
    "total": 20942,
    "transactions": 10591,
    "community": 22,
    "field": 1428,
    "proactive": 1568,
    "selfService": 1316,
    "appointments": 7989,
    "whatsapp": 6017,
    "qr": 16208
  },
  "dhahirah": {
    "name": "الظاهرة",
    "staff": 9,
    "phone": "97875695",
    "total": 18398,
    "transactions": 12516,
    "community": 31,
    "field": 1498,
    "proactive": 695,
    "selfService": 2594,
    "appointments": 6501,
    "whatsapp": 1064,
    "qr": 11173
  },
  "buraimi": {
    "name": "البريمي",
    "staff": 11,
    "phone": "99375880",
    "total": 23389,
    "transactions": 16327,
    "community": 20,
    "field": 2792,
    "proactive": 35,
    "selfService": 3014,
    "appointments": 6991,
    "whatsapp": 1201,
    "qr": 12533
  },
  "musandam": {
    "name": "مسندم",
    "staff": 7,
    "phone": "97875635",
    "total": 8182,
    "transactions": 5308,
    "community": 15,
    "field": 453,
    "proactive": 173,
    "selfService": 1620,
    "appointments": 2525,
    "whatsapp": 613,
    "qr": 5460
  },
  "wusta": {
    "name": "الوسطى",
    "staff": 4,
    "phone": "92008589",
    "total": 7370,
    "transactions": 2804,
    "community": 47,
    "field": 1074,
    "proactive": 228,
    "selfService": 396,
    "appointments": 3324,
    "whatsapp": 2821,
    "qr": 4237
  }
};
  const totalStaff=governorates.all.staff,averageStaff=totalStaff/11,maxStaff=Math.max(...Object.entries(governorates).filter(([key])=>key!=="all").map(([,item])=>item.staff));
  const mapButtons=[...document.querySelectorAll("[data-governorate]")];
  const governorateSelect=document.getElementById("governorateSelect");
  const formatPhone=value=>"+968 "+value.slice(0,4)+" "+value.slice(4);

  function showGovernorate(key,focusInspector=false){
    const item=governorates[key];if(!item)return;
    const isAll=key==="all";
    const difference=Math.round(Math.abs((item.staff-averageStaff)/averageStaff)*100);
    const comparison=isAll?"شبكة المحافظات كاملة":difference<5?"قريب من المتوسط":item.staff>averageStaff?"أعلى بـ "+difference+"%":"أقل بـ "+difference+"%";
    document.querySelector(".inspector-title small").textContent=isAll?"شبكة دوائر الحماية الاجتماعية":"دائرة الحماية الاجتماعية";
    document.getElementById("governorateName").textContent=isAll?item.name:"محافظة "+item.name;
    document.getElementById("governorateStaff").textContent=item.staff.toLocaleString("en-US");
    document.getElementById("governorateShare").textContent=isAll?"100%":(item.staff/totalStaff*100).toFixed(1)+"%";
    document.getElementById("governorateComparison").textContent=comparison;
    document.getElementById("governorateBar").style.width=isAll?"100%":Math.max(13,item.staff/maxStaff*100)+"%";
    const contact=document.getElementById("governorateWhatsapp");
    contact.hidden=isAll;
    if(!isAll){document.getElementById("governoratePhone").textContent=formatPhone(item.phone);contact.href="https://wa.me/968"+item.phone;contact.setAttribute("aria-label","فتح واتساب محافظة "+item.name)}
    document.getElementById("governorateTotalWork").textContent=item.total.toLocaleString("en-US");
    document.getElementById("govTransactions").textContent=item.transactions.toLocaleString("en-US");
    document.getElementById("govAppointments").textContent=item.appointments.toLocaleString("en-US");
    document.getElementById("govWhatsapp").textContent=item.whatsapp.toLocaleString("en-US");
    document.getElementById("govField").textContent=item.field.toLocaleString("en-US");
    document.getElementById("govProactive").textContent=item.proactive.toLocaleString("en-US");
    document.getElementById("govSelfService").textContent=item.selfService.toLocaleString("en-US");
    document.getElementById("govCommunity").textContent=item.community.toLocaleString("en-US");
    document.getElementById("govQr").textContent=item.qr.toLocaleString("en-US");
    governorateSelect.value=key;
    mapButtons.forEach(button=>{
      const active=button.dataset.governorate===key;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    if(focusInspector&&window.innerWidth<900)document.getElementById("governorateInspector").scrollIntoView({behavior:"smooth",block:"start"});
  }
  mapButtons.forEach(button=>button.addEventListener("click",()=>showGovernorate(button.dataset.governorate,true)));
  governorateSelect.addEventListener("change",()=>showGovernorate(governorateSelect.value));
  showGovernorate("all");

  const panel=document.getElementById("boardModePanel");
  const appShell=document.querySelector(".app-shell");
  const openButton=document.getElementById("boardModeButton");
  const closeButton=document.getElementById("exitBoardMode");
  if(!panel||!openButton||!closeButton)return;
  const slides=[...panel.querySelectorAll(".board-slide")];
  const progress=document.getElementById("boardProgress");
  const position=document.getElementById("boardPosition");
  const previous=document.getElementById("boardPrevious");
  const next=document.getElementById("boardNext");
  let boardIndex=0;

  progress.innerHTML=slides.map((slide,index)=>'<button type="button" aria-label="فتح الشريحة '+(index+1)+': '+slide.dataset.boardTitle+'"></button>').join("");
  const progressButtons=[...progress.querySelectorAll("button")];

  function showBoardSlide(index){
    boardIndex=Math.max(0,Math.min(index,slides.length-1));
    slides.forEach((slide,i)=>{
      const active=i===boardIndex;
      slide.classList.toggle("active",active);
      slide.hidden=!active;
    });
    progressButtons.forEach((button,i)=>{
      button.classList.toggle("active",i===boardIndex);
      button.setAttribute("aria-current",i===boardIndex?"step":"false");
    });
    position.innerHTML='<b dir="ltr">'+String(boardIndex+1).padStart(2,"0")+" / "+String(slides.length).padStart(2,"0")+"</b><span> · "+slides[boardIndex].dataset.boardTitle+"</span>";
    previous.disabled=boardIndex===0;
    next.disabled=boardIndex===slides.length-1;
  }
  function openBoardMode(){
    if(document.body.classList.contains("editing"))return;
    document.body.classList.add("board-mode");
    document.body.style.overflow="hidden";
    appShell?.setAttribute("inert","");
    panel.setAttribute("aria-hidden","false");
    showBoardSlide(0);
    closeButton.focus();
  }
  function closeBoardMode(){
    if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
    document.body.classList.remove("board-mode");
    document.body.style.overflow="";
    appShell?.removeAttribute("inert");
    panel.setAttribute("aria-hidden","true");
    openButton.focus();
  }
  openButton.addEventListener("click",openBoardMode);
  closeButton.addEventListener("click",closeBoardMode);
  previous.addEventListener("click",()=>showBoardSlide(boardIndex-1));
  next.addEventListener("click",()=>showBoardSlide(boardIndex+1));
  progressButtons.forEach((button,index)=>button.addEventListener("click",()=>showBoardSlide(index)));
  document.getElementById("boardFullscreen").addEventListener("click",()=>{
    if(document.fullscreenElement)document.exitFullscreen();
    else panel.requestFullscreen?.();
  });
  document.getElementById("printBoardMode").addEventListener("click",()=>{
    document.body.classList.add("board-print");
    window.print();
  });
  window.addEventListener("afterprint",()=>document.body.classList.remove("board-print"));
  document.addEventListener("keydown",event=>{
    if(!document.body.classList.contains("board-mode"))return;
    if(event.key==="Escape"){closeBoardMode();return}
    if(event.key==="ArrowLeft")showBoardSlide(boardIndex+1);
    if(event.key==="ArrowRight")showBoardSlide(boardIndex-1);
  });
  showBoardSlide(0);
})();
