const mainSearch = document.querySelector(".search_item");
const search_btn = document.querySelector(".search_img");
const mainPicture = document.querySelector(".prim_image");
const pictures = document.querySelectorAll(".sec_image");
const bidingContainer = document.querySelector(".bid_form--container");
const bidBtn = document.querySelector(".bid_now_btn");

const btn = document.querySelector(".btn_outline");

if (mainSearch === document.activeElement) {
  alert("active");
}

pictures.forEach((pic) => {
  pic.addEventListener("click", () => {
    mainPicture.setAttribute("src", pic.src);
  });
});

// Bid now
bidBtn.addEventListener("click", () => {
  bidingContainer.classList.add("active");
});
