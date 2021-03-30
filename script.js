const Modal = {
    open() {
        document.querySelector('.modal-overlay')
            .classList.add('active')
    },

    close() {
        document.querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = { 
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    }, 

    set(transactions){ 
        localStorage.setItem("dev.finances:transactions" , JSON.stringify(transactions))
    }
}

const Transcation = {
    //somar entradas
    all: Storage.get(), 
    
    add(transaction) {
        Transcation.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transcation.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0;

        Transcation.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })

        return income;
    },

    //somar saidas
    expenses() {
        let expense = 0;
        Transcation.all.forEach(transcation => {
            if (transcation.amount < 0) {
                expense += transcation.amount;
            }
        })
        return expense;
    },

    //total entradas - saidas
    total() {
        return Transcation.incomes() + Transcation.expenses();
    }

}

const DOM = {

    TranscationsContainer: document.querySelector('#data-table tbody'),

    addTranscation(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTranscation(transaction, index)
        tr.dataset.index = index

        DOM.TranscationsContainer.appendChild(tr)
    },

    innerHTMLTranscation(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html =
            `<td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
        <img onclick="Transcation.remove(${index})" src="./assets/minus.svg" alt="Imagem Remover Transacao">
        </td>`
        return html
    },

    updateBalance() {
        document.getElementById('incomesDisplay').innerHTML = Utils.formatCurrency(Transcation.incomes())
        document.getElementById('expensesDisplay').innerHTML = Utils.formatCurrency(Transcation.expenses())
        document.getElementById('totalsDisplay').innerHTML = Utils.formatCurrency(Transcation.total())
    },

    clearTransactions() {
        DOM.TranscationsContainer.innerHTML = ""
    }
}

const Utils = {

    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100
        return value
    },

    formatDate(date) {
        const splitdDate = date.split("-")
        return `${splitdDate[2]}/${splitdDate[1]}/${splitdDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

        return (signal + value)
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateField() {

        const { description, amount, date } = Form.getValues()
        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {

            throw new Error("Por favor preencher todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description, amount, date
        }

    },

    saveTransaction(transaction) {
        Transcation.add(transaction)

    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""

    },

    submit(event) {

        event.preventDefault()

        try {

            Form.validateField()

            const transaction = Form.formatValues()

            Transcation.add(transaction)

            Form.clearFields()

            Modal.close()

        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {
        Transcation.all.forEach(DOM.addTranscation) 
        DOM.updateBalance()
        Storage.set(Transcation.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()

