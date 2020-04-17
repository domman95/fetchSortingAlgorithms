const heads = document.querySelectorAll('.head')
const listWrapper = document.querySelector('.listWrapper')
const loading = document.querySelector('.loading')
const searchField = document.getElementById('search')
const pagination = document.querySelector('.pagination')

let currentPage = 1;
let rows = 25

let result;

let isSorted = {
    id: false,
    name: false,
    city: false,
    total: false,
    average: false,
    lastMonthTotal: false
}


function getInputValue(e) {
    const value = e.target.value
    let x = result.map(item => {
        item.id = item.id.toString()
        item.total = item.total.toString()
        item.average = item.average.toString()
        item.lastMonthTotal = item.lastMonthTotal.toString()
        return {
            ...item
        }
    })
    findMatches(value, x)
}

async function getCompanies() {
    const response = await fetch('https://recruitment.hal.skygate.io/companies')
    const data = await response.json()
    getFetchByID(data)
}


async function getFetchByID(arr) {
    const id = arr.map(item => `https://recruitment.hal.skygate.io/incomes/${item.id}`)
    let promises = []

    for (let i = 0; i < id.length; i++) {
        promises.push(getIncomes(id[i]))
    }

    Promise.all(promises)
        .then(res => {
            getTogether(arr, res)
        })
        .catch(err => console.error(err))
}

async function getIncomes(x) {
    let response = await fetch(x)
    let data = response.json()
    return data
}

function getTogether(arr, res) {
    let companies = arr.map((item, i) => Object.assign(item, res[i]));
    getTotalOfIncomes(companies)
}

function getTotalOfIncomes(arr) {
    const x = arr.map(item => {
        return {
            ...item, total: Math.floor(getSummary(item.incomes.map(item => { return Number(item.value)})))
        }
    })
    getAverageOfIncomes(x)
}

function getAverageOfIncomes(arr) {
    const x = arr.map(item => {
        const len = item.incomes.length
        const total = item.total
        return {
            ...item, average: Math.floor(getAverage(total, len))
        }
    })
    getLastMonthTotal(x)
}


function getLastMonthTotal(arr) {
    let x = arr.map(item => {
        const sortedDate = item.incomes.map(item => item).sort((a, b) => a.date < b.date ? 1 : -1)
        const convertedDate = sortedDate.map(item => { return { value: item.value, date: convertDate(item.date) } })
        const filteredDate = convertedDate.filter(item => item.date === convertedDate[0].date && item.value)
        return {
            ...item, lastMonthTotal: Math.floor(getSummary(filteredDate.map(item => Number(item.value))))
        }
    })
    x.map(item => delete item.incomes)
    x.sort((a,b) => a.id > b.id ? 1 : -1)
    result = x


    rowsCreator(x)
}

const sorting = (arr, para) => {
    let x;
    searchField.value = ''

    x = arr.map(item => {
        item.id = Number(item.id)
        item.total = Number(item.total)
        item.average = Number(item.average)
        item.lastMonthTotal = Number(item.lastMonthTotal)
        return {
            ...item
        }
    })

    if (isSorted[para]) {
        x = arr.sort((a,b) => a[para] < b[para] ? 1 : -1)
        isSorted[para] = !isSorted[para]
    } else {
        x = arr.sort((a,b) => a[para] > b[para] ? 1 : -1)
        isSorted[para] = !isSorted[para]
    }

    rowsCreator(x)
}

const rowsCreator = (arr, regex, wordToMatch) => {
    setPagination(arr, pagination, rows, regex, wordToMatch)

    listWrapper.innerHTML = ''

    loading.style.display = 'none';
    pagination.style.display = 'flex'

    let loopStart = rows * (currentPage - 1)

    let g = arr.slice(loopStart, loopStart + rows)

    return g.map(item => {

        const row = document.createElement('div')
        row.classList.add('row')
        console.log()
        row.innerHTML = `
        <li id="id">${typeof item.id === 'string' ? item.id.replace(regex, `<span class="color">${wordToMatch}</span>`) : item.id}</li>
        <li id="name">${item.name.replace(regex, `<span class="color">${wordToMatch}</span>`)}</li>
        <li id="city">${item.city.replace(regex, `<span class="color">${wordToMatch}</span>`)}</li>
        <li id="total">${typeof item.total === 'string' ? item.total.replace(regex, `<span class="color">${wordToMatch}</span>`) : item.total}</li>
        <li id="average">${typeof item.average === 'string' ? item.average.replace(regex, `<span class="color">${wordToMatch}</span>`) : item.average}</li>
        <li id="lastMonthTotal">${typeof item.lastMonthTotal === 'string' ? item.lastMonthTotal.replace(regex, `<span class="color">${wordToMatch}</span>`) : item.lastMonthTotal}</li>
        `
        return listWrapper.appendChild(row)   
    })

}

function findMatches(wordToMatch, arr) {
    let regex;
    if (arr) {
        let x =  arr.filter(item => {
            regex = new RegExp(wordToMatch, 'gi');
            return item.city.match(regex) || item.total.match(regex) ||item.name.match(regex) || item.id.match(regex) || item.average.match(regex) || item.lastMonthTotal.match(regex)
        });
        rowsCreator(x, regex, wordToMatch) 
    }    
}

const setPagination = (arr, wrapper, rows, regex, wordToMatch) => {
    wrapper.innerHTML = ''

    let pageCount = Math.ceil(arr.length / rows)
    for (let i = 1; i < pageCount + 1; i++) {
        let btn = paginationBtn(i, arr, regex, wordToMatch);
        wrapper.appendChild(btn)
    }
}

const paginationBtn = (page, arr, regex, wordToMatch) => {
    let button = document.createElement('button')
    button.innerText = page;

    currentPage === page && button.classList.add('active')

    button.addEventListener('click', () => {
        currentPage = page
        rowsCreator(arr, regex, wordToMatch)
    })
    return button
}

const list = (arr) => {
    return arr.map(item => {
        return `
        <div class="data">
        <div>${item.id}</div>
        <div>${item.name}</div>
        <div>${item.city}</div>
        <div>${item.total}</div>
        <div>${item.average}</div>
        <div>${item.lastMonthTotal}</div>
        </div>
        `
    })
}

const convertDate = (date) => {
    const time = new Date(date)
    return `${time.getMonth()}${time.getFullYear()}`
}   

const getSummary = arr => arr.reduce((a, b) => a + b, 0)
const getAverage = (total, len) => Math.floor((total / len),2)

heads.forEach(head => {
    head.addEventListener('click', (e) => {
        const id = e.target.id;
        sorting(result, id)
    })
})

searchField.addEventListener('keyup', (e) => getInputValue(e))


getCompanies()