const Chart = require("chart.js")

exports.todaysDateMinusDays = (days) => {

    const today = new Date()



    const compiledDate = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    compiledDate.setDate(today.getUTCDate() - days)
    if (compiledDate == "Invalid Date") {
        return 0
    }
    const formattedDate = compiledDate.toISOString().split("T")[0]

    return formattedDate
}


exports.salesChart = () => {
    const myChart = new Chart()
}