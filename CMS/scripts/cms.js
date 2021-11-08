$(".date").click(function () {


    const dateButtons = document.getElementsByClassName("date")

    const dbFilter = {}

    for (let item of dateButtons) {


        if (item.disabled) {
            item.style.backgroundColor = "white"
            item.style.color = "#5e5e5e"
            item.disabled = ""
            $(".sold").text("today")
        } else {
            item.style.backgroundColor = "#575757"
            item.style.color = "white"
            item.disabled = "enabled"
            $(".sold").text("in the last 30 days")
            dbFilter["created"] = item.value
        }

    }
    $.ajax({
        url: "/dashboard",
        method: "GET",
        data: dbFilter,
        dataType: 'text',
        success: function (data) {
            $('#user-num').html($('#user-num', data).html());
            $('#t-num').html($('#t-num', data).html());
            $('#order-num').html($('#order-num', data).html());
            $('#t-orders').html($('#t-orders', data).html());
            $('#order-num').html($('#order-num', data).html());
            $('#book-num').html($('#book-num', data).html());
            $('#t-books').html($('#t-books', data).html());

        }
    });



})


const labels = [
    '2021/10/01',
    '2021/10/05',
    '2021/10/10',
    '2021/10/15',
    '2021/10/20',
    '2021/10/25',
    '2021/10/30',
];
const data = {
    labels: labels,
    datasets: [{
        label: 'Sales',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [5, 11, 2, 4, 3, 1, 14],
    }]
};

const config = {
    type: 'bar',
    data: data,
    options: {}
};


const myChart = new Chart(
    document.getElementById('myChart'),
    config
);