// ***** BASKET SCRIPTS ***** //

const basketUpdate = {
    basketId: String,
    totalValue: Number,
    items: {
        id: Object,
    },
};

const formatPrice = (strPrice) => {
    return strPrice.toFixed(2);
};

const qty = (objElement) => {
    return objElement.value;
};
// Finding the price of the current book. This refers to the input selected in the row
// E.g when I adjust qty on the second row, this refers to that row and that row only
const priceOfBook = (objElement) => {
    return $(objElement).closest("li").find(".book-basket-price .bprice").text();
};

const subtotal = (objElement) => {
    return $(objElement)
        .closest("li")
        .find(".book-basket-subtotal .subtotal-price");
};

// calculate the subtotal by multiplying the bookPrice with bookQty
const calculatedSubtotal = (bookPrice, bookQty) => {
    return formatPrice(bookPrice * bookQty);
};

// Get the id of the book in the basket
const basketBookId = (objElement) => {
    return $(objElement).closest("li").attr("id");
};

// Get the basket ID
const basketId = (objElement) => {
    return $(objElement).closest(".basket-view").attr("id");
};

// This function allows the basket to update the subtotal and total value of basket without reloading the page
// ***** UPDATE BASKET PRICE ***** //
$(".qty").on("input", function () {
    $(subtotal(this)).html(calculatedSubtotal(priceOfBook(this), qty(this)));

    // find the total value section within the HTML
    const totalValue = $(".main-content-container").find(
        ".header-row .total-value"
    );
    // Calculate the total of the basket by grabbing all the subtotals from each item
    // Once obtained it's put through a map to convert each value to a float
    // then reduce is used to obtain the total value
    const calculatedTotalValue = Array.from(
        $(".subtotal-price").map(function () {
            return parseFloat($(this).text());
        })
    ).reduce((a, b) => {
        return a + b;
    }, 0);
    // This changes the subtotal value without reloading the page
    $(totalValue).html(formatPrice(calculatedTotalValue));
});

// ***** UPDATE DATABASE WITH NEW VALUES ***** //

// Initially decided to update the database on the fly by debouncing the requests to 1 seconds, but after thinking about the implications of the database being pinged constantly  //
// Made me change my approach to only updating once the checkout button has been pressed //


$(".qty").on("input", function () {

    /// Make into function
    const calculatedTotalValue = Array.from(
        $(".subtotal-price").map(function () {
            return parseFloat($(this).text());
        })
    ).reduce((a, b) => {
        return a + b;
    }, 0);

    const basketData = {
        qty: qty(this),
        subtotal: calculatedSubtotal(priceOfBook(this), qty(this)),
    };
    basketUpdate.items[basketBookId(this)] = { basketData };
    console.log(basketData);
});

$(".delete-btn").click(function () {

    const bookId = this.closest("li").id

    $.ajax({
        url: "/delete-from-basket/" + bookId,
        method: "DELETE",
        contentType: "application/json; charset=utf-8",
        success: function () {
            location.reload()
        },
        error: function (error) {
            console.log("error", error);
        }
    })


})

$("#basket-to-checkout").click(function () {
    $.ajax({
        url: "/update-basket/" + basketId,
        method: "PUT",
        data: JSON.stringify(basketUpdate),
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            window.location.href = "http://localhost:5002/checkout"
            console.log(data);
        }
    });
});

$("input[name=delivery-method]").change(function () {


    const radioButtonShippingCost = $(this).closest("div").find(".delivery-price").text().split("£")[1]

    const productSubtotal = $("#product-subtotal").text().split("£")[1]

    $("#shipping-cost").html(`Shipping Cost: £${radioButtonShippingCost}`)

    const combinedTotal = parseFloat(radioButtonShippingCost) + parseFloat(productSubtotal)

    $("#combined-cost").html(`Combined Total: £${combinedTotal}`)

})

// ***** STRIPE CHECKOUT ***** //
const button = document.querySelector("button")

$(".checkout-button").click(function () {
    const dbShippingCost = $("#delivery-method:checked").val()
    const basket = $(".checkout-button").attr("id")
    fetch("http://localhost:5002/stripe-checkout-session/" + basket, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ postage: dbShippingCost })
    })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            return res.json().then(json => Promise.reject(json));
        })
        .then(({ url }) => {
            window.location = url;
        })
        .catch(e => {
            console.error(e.error);
        });

});

// ****** WISHLIST ****** //

$(".wishlist").click(function () {
    const bookId = $(this).closest(".book").attr("id")
    const svg = $(this).find(".wishlist-svg-click");
    if (svg.css("fill") === "rgb(243, 134, 134)") {
        svg.css({ fill: "#f8f5f2" });
    } else {
        svg.css({ fill: "rgb(243, 134, 134)" });
    }
    $.ajax({
        url: "/wishlist/" + bookId,
        method: "POST",
        data: JSON.stringify(basketUpdate),
        contentType: "application/json; charset=utf-8",
    });
})


$(".wishlist").hover(function () {
    const svg = $(this).find(".wishlist-svg-click");
    if (svg.css("fill") === "rgb(243, 134, 134)") {
        svg.css({ fill: "#f8f5f2" });
    } else {
        svg.css({ fill: "rgb(243, 134, 134)" });
    }

})
