window.addEventListener("load", () => {
  if (localStorage.getItem("data")) {
    restoreFromStorage()
  } else {
    addRow()
  }

  document.activeElement.blur()
  document
    .querySelector("input#txtUnitPrice")
    .addEventListener("input", onTxtUnitPriceChanged)
})

function addRow() {
  const tbody = document.querySelector("tbody")
  if (!tbody) {
    alert("how tf? :3")
    return
  }

  const html = `
    <tr>
        <td>
            <input class="txtQuality" inputmode="decimal" oninput="onUpdatePrice(this)" placeholder="..." />
        </td>
        <td>
            <input class="txtWeight" inputmode="decimal" oninput="onUpdatePrice(this)" placeholder="..." />
        </td>
        <td>
            <input class="txtPrice" inputmode="decimal" oninput="onPriceChanged(this)" />
        </td>
        <td>
          <button type="button" onclick="deleteRow(this)">✖</button>
        </td>
    </tr>
    `

  tbody.insertAdjacentHTML("beforeend", html)

  const l = document.querySelectorAll("tr")
  const lastElement = l[l.length - 1]
  if (!lastElement) {
    alert("how ? :3")
    return
  }

  const txtPercent = lastElement.querySelector("input")
  if (txtPercent) {
    txtPercent.focus()
  }
}

function deleteRow(btn) {
  let tr = btn?.parentNode?.parentNode
  if (!tr) {
    alert("no tr? how? :3")
    return
  }

  if (document.querySelectorAll("tr").length == 2) {
    tr.querySelectorAll("input").forEach((txt) => (txt.value = ""))
  } else {
    tr.remove()
  }

  calculateResult()
}

function getTrInputs(txt) {
  let tr = txt?.parentNode?.parentNode
  if (!tr) {
    alert("no tr? how? :3")
    return null
  }

  return {
    txtQuality: tr.querySelector("input.txtQuality"),
    txtWeight: tr.querySelector("input.txtWeight"),
    txtPrice: tr.querySelector("input.txtPrice"),
  }
}

function stringToNumba(value) {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  let s = String(value).trim()
  if (s === "") return 0

  // replace comma with dot and strip unexpected characters
  s = s.replace(/,/g, ".").replace(/[^0-9.\-+eE]/g, "")

  const n = Number(s)
  return isFinite(n) ? n : 0
}

function numbaToString(value) {
  // made by ChagGPT
  if (value === null || value === undefined) return ""
  let s = String(value).trim()
  if (s === "") return ""

  // replace comma with dot, strip unexpected chars
  s = s.replace(/,/g, ".").replace(/[^0-9.\-+eE]/g, "")

  const n = Number(s)
  if (!isFinite(n)) return ""

  // round to 2 decimals then remove trailing zeros and optional dot
  return n.toFixed(2).replace(/\.?0+$/, "")
}

function onUpdatePrice(txt, update_result = true) {
  const ui = getTrInputs(txt)
  if (!ui) {
    alert("wtf? :3")
    return
  }

  const unitPrice100 = stringToNumba(
    document.querySelector("input#txtUnitPrice").value
  )
  const quality = stringToNumba(ui.txtQuality.value)
  const weight = stringToNumba(ui.txtWeight.value)
  const price = weight * unitPrice100 * (quality / 100)
  ui.txtPrice.value = numbaToString(price)

  if (update_result) {
    calculateResult()
  }
}

function onPriceChanged() {
  calculateResult()
}

function onTxtUnitPriceChanged() {
  for (const tr of document.querySelectorAll("tr")) {
    const txtPrice = tr.querySelector("input.txtPrice")

    // თუ th როუა
    if (!txtPrice) {
      continue
    }

    onUpdatePrice(txtPrice, false)
  }

  calculateResult()
}

function calculateResult() {
  let total = 0
  for (const tr of document.querySelectorAll("tr")) {
    const txtPrice = tr.querySelector("input.txtPrice")

    // თუ th როუა
    if (!txtPrice) {
      continue
    }

    total += parseFloat(txtPrice.value)
  }

  document.querySelector("span#lblTotalPrice").innerHTML = isNaN(total)
    ? 0
    : total.toFixed(2)

  saveToStorage()
}

function saveToStorage() {
  const data = {
    unitPrice100: document.querySelector("input#txtUnitPrice").value,
    totalPrice: document.querySelector("span#lblTotalPrice").innerHTML,
    listPrices: [],
  }

  if (stringToNumba(data.totalPrice) <= 0) {
    return
  }

  for (const tr of document.querySelectorAll("tr")) {
    const txtQuality = tr.querySelector("input.txtQuality")
    const txtWeight = tr.querySelector("input.txtWeight")
    const txtPrice = tr.querySelector("input.txtPrice")

    // th :3
    if (!txtQuality) {
      continue
    }

    data.listPrices.push({
      quality: txtQuality.value,
      weight: txtWeight.value,
      price: txtPrice.value,
    })
  }

  localStorage.setItem("data", JSON.stringify(data))
}

function restoreFromStorage() {
  const data = JSON.parse(localStorage.getItem("data"))
  document.querySelector("input#txtUnitPrice").value = data.unitPrice100
  document.querySelector("span#lblTotalPrice").innerHTML = data.totalPrice

  if (data.listPrices.length === 0) {
    addRow()
    return
  }
  
  for (const d of data.listPrices) {
    console.log(d)
    addRow()
    const l = document.querySelectorAll("tr")
    const lastTr = l[l.length - 1]
    if (!lastTr) {
      continue
    }

    lastTr.querySelector("input.txtQuality").value = d.quality
    lastTr.querySelector("input.txtWeight").value = d.weight
    lastTr.querySelector("input.txtPrice").value = d.price
  }

  calculateResult()
}
