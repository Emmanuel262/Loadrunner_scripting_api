const form = document.querySelector(".login_form--form");
const emailError = document.querySelector(".email.error");
const passwordError = document.querySelector(".password.error");

// Reset errors
emailError.textContent = "";
passwordError.textContent = "";

form.addEventListener("click", async (e) => {
  e.preventDefault();
  const first_name = form.querySelector("#fname");
  const last_name = form.querySelector("#fname");
  const idNumber = form.querySelector("#idNumber");

  console.log(first_name, last_name, idNumber);

  // // get the values
  // const email = form.email.value
  // const password = form.password.value

  // try {
  //     const result = await fetch('/signup', {
  //         method: 'POST',
  //         body: JSON.stringify({email, password}),
  //         headers: {'Content-Type': 'application/json'}
  //     });
  //     const data = await result.json()
  //     console.log(data)
  //     if (data.errors) {
  //         emailError.textContent = data.errors.email
  //         passwordError.textContent = data.errors.password
  //     }
  //     if (data.user) {
  //         location.assign('/');
  //     }
  // } catch (error) {
  //     console.log(error)
  // }
});
