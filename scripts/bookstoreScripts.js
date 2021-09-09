// ***** BASKET SCRIPTS ***** //

const formatPrice = (strPrice) => {
    return strPrice.toFixed(2);
};

// This function allows the basket to update the subtotal and total value of basket without reloading the page
$(".qty").on("input", function () {
    // Finding the price of the current book. This refers to the input selected in the row
    // E.g when I adjust qty on the second row, this refers to that row and that row only
    const priceOfBook = $(this)
        .closest("li")
        .find(".book-basket-price .bprice")
        .text();

    // Same as the above but with subtotal
    const subtotal = $(this)
        .closest("li")
        .find(".book-basket-subtotal .total-price");

    // Same as the above but with qty
    const qty = this.value;

    const calculatedSubtotal = priceOfBook * qty;

    $(subtotal).html(formatPrice(calculatedSubtotal));

    // find the total value section within the HTML
    const totalValue = $(".main-content-container").find(
        ".header-row .total-value"
    );

    // Calculate the total of the basket by grabbing all the subtotals from each item
    // Once obtained it's put through a map to convert each value to a float
    // then reduce is used to obtain the total value
    const calculatedTotalValue = Array.from(
        $(".total-price").map(function () {
            return parseFloat($(this).text());
        })
    ).reduce((a, b) => {
        return a + b;
    }, 0);

    console.log(calculatedTotalValue);

    // This changes the subtotal value without reloading the page
    $(totalValue).html(formatPrice(calculatedTotalValue));
});
