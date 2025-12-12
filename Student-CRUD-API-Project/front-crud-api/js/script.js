const API_URL = 'http://localhost:3000/api/users'


const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")

if(registerForm){
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const username = document.getElementById("registerUser").value
        const email = document.getElementById("registerEmail").value
        const password = document.getElementById("registerPassword").value
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            })
            const data = await response.json()
            if(response.ok){
                alert("User registered successfully")
                window.location.href = "index.html"
            } else {
                alert(data.message)
            }
        } catch (err) {
            alert(err.message)
        }
    })
}

if(loginForm){
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const username = document.getElementById("loginUser").value
        const password = document.getElementById("loginPassword").value
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            })
            const data = await response.json()
            if(response.ok){
                localStorage.setItem("token", data.token)
                // alert("User logged in successfully")
                window.location.href = "students.html"
            } else {
                alert(data.message || "Login failed")
            }
        } catch (err) {
            alert(err.message)
        }
    })
}