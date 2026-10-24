// Nav background once the page scrolls
const nav = document.querySelector(".nav")
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24)
onScroll()
window.addEventListener("scroll", onScroll, { passive: true })

// Reveal elements as they enter the viewport
const revealables = document.querySelectorAll(".reveal")
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in")
          io.unobserve(entry.target)
        }
      })
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  )
  revealables.forEach(el => io.observe(el))
} else {
  revealables.forEach(el => el.classList.add("is-in"))
}

// Per-project accent colour + floating "Visit site" label
const label = document.querySelector(".cursor-label")
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches

document.querySelectorAll(".project").forEach(project => {
  project.style.setProperty("--accent", project.dataset.accent)
  if (!finePointer) return
  const link = project.querySelector("a")
  link.addEventListener("mouseenter", () => label.classList.add("is-on"))
  link.addEventListener("mouseleave", () => label.classList.remove("is-on"))
})

if (finePointer) {
  window.addEventListener(
    "mousemove",
    e => {
      label.style.setProperty("--x", `${e.clientX + 18}px`)
      label.style.setProperty("--y", `${e.clientY + 18}px`)
    },
    { passive: true }
  )
}

// Live local time for each client country
const clocks = [...document.querySelectorAll(".clock")].map(el => ({
  out: el.querySelector(".clock__time"),
  fmt: new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: el.dataset.tz,
  }),
}))

const tick = () => {
  const now = new Date()
  clocks.forEach(({ out, fmt }) => (out.textContent = fmt.format(now)))
}
tick()
setInterval(tick, 15000)

// Contact form — validated in the browser, submitted to Netlify Forms
const form = document.querySelector("form[name='contact']")
const status = form.querySelector(".form__status")
const button = form.querySelector("button[type='submit']")
const buttonLabel = button.querySelector(".btn__label")

const fields = ["name", "email", "message"].map(name => form.elements[name])

const validate = input => {
  const ok = input.checkValidity()
  input.closest(".field").classList.toggle("is-invalid", !ok)
  return ok
}

fields.forEach(input => {
  input.addEventListener("blur", () => input.value && validate(input))
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("is-invalid")) validate(input)
  })
})

form.addEventListener("submit", async event => {
  event.preventDefault()

  const invalid = fields.filter(input => !validate(input))
  if (invalid.length) {
    invalid[0].focus()
    status.className = "form__status is-error"
    status.textContent = "A couple of fields need another look."
    return
  }

  button.disabled = true
  button.classList.add("is-loading")
  buttonLabel.textContent = "Sending…"
  status.className = "form__status"
  status.textContent = ""

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    })
    if (!response.ok) throw new Error(`Status ${response.status}`)

    form.reset()
    status.className = "form__status is-success"
    status.textContent = "Thank you — your message is in. I'll get back to you soon."
    buttonLabel.textContent = "Message sent"
  } catch {
    status.className = "form__status is-error"
    status.textContent = "Something went wrong sending that. Please try again in a moment."
    buttonLabel.textContent = "Send message"
  } finally {
    button.disabled = false
    button.classList.remove("is-loading")
  }
})

document.getElementById("year").textContent = new Date().getFullYear()