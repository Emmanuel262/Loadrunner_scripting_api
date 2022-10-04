const activitiesList = document.querySelectorAll(".req_lists--item"),
  contentContainer = document.querySelectorAll(".contents__container");

activitiesList.forEach((activity) => {
  activity.addEventListener("click", () => {
    if (document.querySelector(".req_lists--item.active") != null) {
      document
        .querySelector(".req_lists--item.active")
        .classList.remove("active");
    }
    activity.classList.add("active");
    const reqClass = activity.classList[1];
    contentContainer.forEach((content) => {
      content.classList.remove("active");
      if (content.classList.contains(reqClass)) {
        content.classList.add("active");
      }
    });
  });
  //   setActiveAwesome();
  //   if (activity.classList.contains("active")) {
  //     console.log(activity);
  //   }
  //   contentContainer.forEach((content) => {
  //     if (content.classList.contains("active")) {
  //       content.classList.remove("active");
  //     }
  //     content.classList.add("active");
  //   });
});

function setActiveClass() {
  if (document.querySelector(".req_lists--item.active") != null) {
    document
      .querySelector(".req_lists--item.active")
      .classList.remove("active");
  }
  this.classList.add("active");
}

function setActiveAwesome() {
  if (document.querySelector(".contents__container.active") != null) {
    document
      .querySelector(".contents__container.active")
      .classList.remove("active");
  }
  document.querySelector(".contents__container").classList.add("active");
}
