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

// Initially decided to update the database on the fly by debouncing to the requests to 1 seconds, but after thinking about the implications of the database being pinged constantly  //
// Made me change my approach to only updating once the checkout button has been pressed //

let debounce = null;
$(".qty").on("input", function () {
    clearTimeout(debounce);

    /// Make into function
    const calculatedTotalValue = Array.from(
        $(".subtotal-price").map(function () {
            return parseFloat($(this).text());
        })
    ).reduce((a, b) => {
        return a + b;
    }, 0);

    basketData = {
        qty: qty(this),
        subtotal: calculatedSubtotal(priceOfBook(this), qty(this)),
    };
    basketUpdate.items[basketBookId(this)] = { basketData };
    basketUpdate.totalValue = formatPrice(calculatedTotalValue);
    basketUpdate.basketId = basketId(this);
});

$(".btn").click(function () {
    $.ajax({
        url: "/update-basket/" + basketId,
        method: "POST",
        data: JSON.stringify(basketUpdate),
        contentType: "application/json; charset=utf-8",
    });
});
