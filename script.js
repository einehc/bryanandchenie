const welcome=document.getElementById("welcome");
const backgroundMusic=document.getElementById("backgroundMusic");
const musicToggle=document.getElementById("musicToggle");
backgroundMusic.volume=.35;
async function startMusic(){
  try{
    await backgroundMusic.play();
    musicToggle.classList.add("playing");
    musicToggle.setAttribute("aria-label","Pause music");
    musicToggle.setAttribute("aria-pressed","true");
  }catch(error){
    musicToggle.classList.remove("playing");
    musicToggle.setAttribute("aria-label","Play music");
    musicToggle.setAttribute("aria-pressed","false");
  }
}
document.getElementById("openInvitation").addEventListener("click",()=>{
  if(welcome.classList.contains("opening")) return;
  startMusic();
  welcome.classList.add("opening");
  setTimeout(()=>welcome.classList.add("closed"),950);
});
musicToggle.addEventListener("click",()=>{
  if(backgroundMusic.paused) startMusic();
  else{
    backgroundMusic.pause();
    musicToggle.classList.remove("playing");
    musicToggle.setAttribute("aria-label","Play music");
    musicToggle.setAttribute("aria-pressed","false");
  }
});

const menu=document.getElementById("menuBtn");
const links=document.getElementById("navLinks");
menu.addEventListener("click",()=>{
  const isOpen=links.classList.toggle("open");
  menu.setAttribute("aria-expanded",String(isOpen));
});
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>{
  links.classList.remove("open");
  menu.setAttribute("aria-expanded","false");
}));

const weddingTime=new Date("2027-01-08T10:00:00+08:00").getTime();
function countdown(){
  const diff=Math.max(0,weddingTime-Date.now());
  let s=Math.floor(diff/1000);
  const days=Math.floor(s/86400); s%=86400;
  const hours=Math.floor(s/3600); s%=3600;
  const minutes=Math.floor(s/60); const seconds=s%60;
  document.getElementById("days").textContent=String(days).padStart(3,"0");
  document.getElementById("hours").textContent=String(hours).padStart(2,"0");
  document.getElementById("minutes").textContent=String(minutes).padStart(2,"0");
  document.getElementById("seconds").textContent=String(seconds).padStart(2,"0");
}
countdown();setInterval(countdown,1000);

const lightbox=document.getElementById("lightbox");
const galleryImages=Array.from({length:25},(_,index)=>({
  src:`images/gallery photos/bc${index+1}.jfif`,
  alt:`Bryan and Chenie photo ${index+1}`
}));
const galleryCards=[...document.querySelectorAll(".gallery-photo")];
const lightboxImage=lightbox.querySelector("img");
const galleryCount=document.getElementById("galleryCount");
const galleryPrevious=document.getElementById("galleryPrevious");
const galleryNext=document.getElementById("galleryNext");
const lightboxPrevious=document.getElementById("lightboxPrevious");
const lightboxNext=document.getElementById("lightboxNext");
let galleryIndex=0;
function showGalleryImage(index){
  galleryIndex=(index+galleryImages.length)%galleryImages.length;
  galleryCards.forEach((card,slot)=>{
    const image=galleryImages[(galleryIndex+slot)%galleryImages.length];
    const cardImage=card.querySelector("img");
    cardImage.classList.add("gallery-transition");
    cardImage.src=image.src;
    cardImage.alt=image.alt;
    card.dataset.galleryIndex=(galleryIndex+slot)%galleryImages.length;
    requestAnimationFrame(()=>cardImage.classList.remove("gallery-transition"));
  });
  const image=galleryImages[galleryIndex];
  lightboxImage.src=image.src;
  lightboxImage.alt=image.alt;
  galleryCount.textContent=`${galleryIndex+1} / ${galleryImages.length}`;
  galleryPrevious.disabled=galleryImages.length<2;
  galleryNext.disabled=galleryImages.length<2;
  requestAnimationFrame(()=>galleryImage.classList.remove("gallery-transition"));
}
galleryPrevious.addEventListener("click",()=>showGalleryImage(galleryIndex-1));
galleryNext.addEventListener("click",()=>showGalleryImage(galleryIndex+1));
galleryCards.forEach(card=>card.addEventListener("click",()=>{
  showGalleryImage(Number(card.dataset.galleryIndex));
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
}));
lightboxPrevious.addEventListener("click",()=>showGalleryImage(galleryIndex-1));
lightboxNext.addEventListener("click",()=>showGalleryImage(galleryIndex+1));
showGalleryImage(0);
function closeBox(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true")}
document.getElementById("closeLightbox").addEventListener("click",closeBox);

const rsvpForm=document.getElementById("rsvpForm");
const formMessage=document.getElementById("formMessage");
const rsvpModal=document.getElementById("rsvpModal");
const rsvpModalMessage=document.getElementById("rsvpModalMessage");
const rsvpModalClose=document.getElementById("closeRsvpModal");
const rsvpModalDone=document.getElementById("rsvpModalDone");
const storyModal=document.getElementById("storyModal");
const storyModalOpen=document.getElementById("openStoryModal");
const storyModalClose=document.getElementById("closeStoryModal");
const RSVP_ENDPOINT="https://script.google.com/macros/s/AKfycbx7lMf5G9phR7QWMWC1WUNOWtt7Tqa6pCSIJPv5r-bhRiqhMUrX0P1on0EwnLdxd98LuQ/exec";
function showRsvpModal(message){
  rsvpModalMessage.textContent=message;
  rsvpModal.classList.add("open");
  rsvpModal.setAttribute("aria-hidden","false");
  rsvpModalDone.focus();
}
function closeRsvpModal(){
  rsvpModal.classList.remove("open");
  rsvpModal.setAttribute("aria-hidden","true");
}
const savedRsvp=localStorage.getItem("bryanChenieRsvp");
if(savedRsvp){
  try{
    const savedData=JSON.parse(savedRsvp);
    Object.entries(savedData).forEach(([name,value])=>{
      const field=rsvpForm.elements[name];
      if(field) field.value=value;
    });
  }catch(error){
    localStorage.removeItem("bryanChenieRsvp");
  }
}
rsvpForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const d=new FormData(e.target);
  const response=Object.fromEntries(d.entries());
  localStorage.setItem("bryanChenieRsvp",JSON.stringify(response));
  formMessage.classList.remove("success","error");
  if(!RSVP_ENDPOINT || RSVP_ENDPOINT==="PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"){
    formMessage.textContent="RSVP delivery is not configured yet. Please contact Bryan & Chenie directly.";
    formMessage.classList.add("error");
    return;
  }
  formMessage.textContent="Sending your RSVP...";
  try{
    await fetch(RSVP_ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify(response)});
    formMessage.textContent="";
    showRsvpModal(`Thank you, ${response.name}! Your RSVP has been sent.`);
    rsvpForm.reset();
  }catch(error){
    formMessage.textContent=`Your RSVP is saved here, but online delivery failed. Please try again.`;
    formMessage.classList.add("error");
  }
});
rsvpModalClose.addEventListener("click",closeRsvpModal);
rsvpModalDone.addEventListener("click",closeRsvpModal);
rsvpModal.addEventListener("click",event=>{if(event.target===rsvpModal) closeRsvpModal()});
document.addEventListener("keydown",event=>{if(event.key==="Escape" && rsvpModal.classList.contains("open")) closeRsvpModal()});
storyModalOpen.addEventListener("click",event=>{
  event.preventDefault();
  storyModal.showModal();
});
storyModalClose.addEventListener("click",()=>storyModal.close());
storyModal.addEventListener("cancel",event=>event.preventDefault());
