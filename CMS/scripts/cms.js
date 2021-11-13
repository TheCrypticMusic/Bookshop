getFilterObject = (buttonName) => {
    const buttons = document.getElementsByClassName(buttonName);
    const dbFilter = {};

    for (let item of buttons) {
        if (!item.disabled) dbFilter["created"] = item.value;
    }

    return dbFilter;
};

changeText = (className, text) => {
    $(className).text(text);
};

changeHighlightedButton = (className) => {
    const buttons = document.getElementsByClassName(className);

    for (let item of buttons) {
        if (item.disabled) {
            item.style.backgroundColor = "white";
            item.style.color = "#5e5e5e";
            item.disabled = "";
        } else {
            item.style.backgroundColor = "#575757";
            item.style.color = "white";
            item.disabled = "enabled";
        }
    }
};

const changeTextIfButtonDisabled = (buttonId, textClass, enabledText, disabledText) => {
    const selectedButton = document.getElementById(buttonId);
    if (selectedButton.disabled) {
        changeText(textClass, disabledText);
    } else {
        changeText(textClass, enabledText);
    }
};

// const prepareBreakdownCharts = (data, dateRange) => {

//     if (dateRange == 30) {
//         prepareMonthChart()
//     }

// }


$(".snapshot-date").click(function () {
    const dbFilter = getFilterObject("snapshot-date");
    changeHighlightedButton("snapshot-date");
    changeTextIfButtonDisabled("snapshot-date-today", ".sold", "in the last 30 days", "today");
    $.ajax({
        url: "/dashboard/snapshots",
        method: "GET",
        data: dbFilter,
        dataType: "json",
        success: function (data) {
            $(".date-range-users").html(data["dateRangeUsers"]);
            $(".date-range-orders").html(data["dateRangeOrders"]);
            $(".date-range-books").html(data["dateRangeBooks"]);
        },
    });
});

$(".breakdown-orders").click(function () {
    const dbFilter = getFilterObject("breakdown-orders");

    changeHighlightedButton("breakdown-orders");
    // console.log(dbFilter)
    $.ajax({
        url: "/dashboard/breakdown/orders",
        method: "GET",
        data: dbFilter,
        dataType: "json",
        success: function (data) {
            console.log(data)
            if (dbFilter.created === "30") {
                updateChart(window.orderChart, data, "Orders - 30 Days", "day", "orders", 25);
            } else {
                updateChart(window.orderChart, data, "Orders - Year", "month", "orders");
            }
        },
    });



});


$(".breakdown-books").click(function () {
    const dbFilter = getFilterObject("breakdown-books");
    console.log(dbFilter)
    changeHighlightedButton("breakdown-books");

    $.ajax({
        url: "/dashboard/breakdown/books",
        method: "GET",
        data: dbFilter,
        dataType: "json",
        success: function (data) {
            console.log(data)
            if (dbFilter.created === "30") {
                updateChart(window.bookChart, data, "Books Sold - 30 Days", "day", "books", 25);
            } else {
                updateChart(window.bookChart, data, "Books Sold - Year", "month", "books");
            }
        },
    });
});




$(".breakdown-account").click(function () {
    const dbFilter = getFilterObject("breakdown-account");

    changeHighlightedButton("breakdown-account");

    $.ajax({
        url: "/dashboard/breakdown/accounts",
        method: "GET",
        data: dbFilter,
        dataType: "json",
        success: function (data) {


            if (dbFilter.created === "30") {
                updateChart(window.accountChart, data, "Accounts Created - 30 Days", "day", "users", 25);
            } else {
                updateChart(window.accountChart, data, "Accounts Created - Year", "month", "users");
            }
        },
    });
});


function updateChart(chart, data, label, unit, graphName, maxTicks) {


    chart.data.datasets[0].data = data.data[graphName];

    chart.data.datasets[0].label = label;
    chart.options.scales.x = {
        type: "timeseries",
        time: {
            unit: unit
        },
        ticks: {
            maxTicksLimit: maxTicks
        }
    

    };
    chart.update();
}


function setupOrderChart() {



    return $.ajax({
        url: "/dashboard/breakdown/orders",
        method: "GET",
        data: {
            created: 30
        },
        dataType: "json",
        success: function (data) {

            window.orderChart.data.datasets[0].data = data.data["orders"];

            window.orderChart.data.datasets[0].label = "Orders - 30 Days";
            window.orderChart.options.scales.x = {
                type: "timeseries",
                time: {
                    unit: "day"
                },
                ticks: {
                    maxTicksLimit: 25
                }

            };
            window.orderChart.update();
        },
    })
}

function setupBookChart() {


    return $.ajax({
        url: "/dashboard/breakdown/books",
        method: "GET",
        data: {
            created: 30
        },
        dataType: "json",
        success: function (data) {
            console.log(data)
            window.bookChart.data.datasets[0].data = data.data["books"];

            window.bookChart.data.datasets[0].label = "Books Sold - 30 Days";
            window.bookChart.options.scales.x = {
                type: "timeseries",
                time: {
                    unit: "day"
                },
                ticks: {
                    maxTicksLimit: 25
                }

            };
            window.bookChart.update();

        },
    });

}

function setupAccountChart() {


    return $.ajax({
        url: "/dashboard/breakdown/accounts",
        method: "GET",
        data: {
            created: 30
        },
        dataType: "json",
        success: function (data) {
    
            window.accountChart.data.datasets[0].data = data.data["users"];

            window.accountChart.data.datasets[0].label = "Accounts Created - 30 Days";
            window.accountChart.options.scales.x = {
                type: "timeseries",
                time: {
                    unit: "day"
                },
                ticks: {
                    maxTicksLimit: 25
                }

            };
            window.accountChart.update();

        },
    });

}




window.onload = function () {
    const ctx = document.getElementById("book-chart").getContext("2d");
    window.bookChart = new Chart(ctx, {
        type: "bar",
        data: {
            datasets: [{
                label: "",
                data: [{}],

                backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                ],
                borderWidth: 1,
            },],
            // labels: ["gdsf"]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "timeseries",

                    time: {
                        unit: "day",
                    },
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    const ctx1 = document.getElementById("order-chart").getContext("2d");
    window.orderChart = new Chart(ctx1, {
        type: "bar",
        data: {
            datasets: [{
                label: "",
                data: [{}],

                backgroundColor: [
                    "rgba(255, 159, 64, 0.5)",
                ],
                borderColor: [
                    "rgba(255, 159, 64, 1)",
                ],
                borderWidth: 1,
            },],

        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "timeseries",

                    time: {
                        unit: "day",
                    },
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    const ctx2 = document.getElementById("account-chart").getContext("2d");
    window.accountChart = new Chart(ctx2, {
        type: "bar",
        data: {
            datasets: [{
                label: "",
                data: [{}],

                backgroundColor: [
                    "rgba(75, 192, 192, 0.5)",
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                ],
                borderWidth: 1,
            },],
            // labels: ["gdsf"]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "timeseries",

                    time: {
                        unit: "day",
                    },
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    setupBookChart()
    setupOrderChart()
    setupAccountChart()

}




$(".book-type").change(function () {


// TODO: PARSE DATA 
    const bookSkuIdArray = $(this.options[this.selectedIndex])
    const bookSkuId = bookSkuIdArray[0].id
    const bookId = $(this).closest("tr")[0].id

    const bookPrice = $(this).closest("tr").find(".book-price")
    const bookStock = $(this).closest("tr").find(".book-stock")
    
    const bookData = {
        "bookId": bookId,
        "bookSkuId": bookSkuId
    }
    $.ajax({
        url: "/books/get-sku",
        method: "GET",
        dataType: "json",
        data: bookData,
        success: function (data) {
            bookPrice.html(`£${data.price}`)
            bookStock.html(`${data.stock}`)
            // if (dbFilter.created === "30") {
            //     updateChart(window.accountChart, data, "Accounts Created - 30 Days", "day", "users", 25);
            // } else {
            //     updateChart(window.accountChart, data, "Accounts Created - Year", "month", "users");
            // }
        },
    });

})