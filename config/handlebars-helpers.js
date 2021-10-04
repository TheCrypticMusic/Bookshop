module.exports = {
    indexOf: function (index, options) {
        if (index === 0) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    padNumber: function (price) {
        if (price) {
            return price.toFixed(2);
        }
    },
    bestsellers: function (cat, options) {
        if ("Bestsellers" === cat) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    recentlyAdded: function (cat, options) {
        if ("Recently Added" === cat) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    nonFiction: function (genre, options) {
        if ("Non-Fiction" === genre) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    fiction: function (genre, options) {
        if ("Fiction" === genre) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    sciFi: function (genre, options) {
        if ("Sci-Fi" === genre) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    fantasy: function (genre, options) {
        if ("Fantasy" === genre) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    ifEquals: function (arg1, arg2, options) {
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    },
    inList: function (elem, list, options) {
        if (list) {
            if (list.indexOf(elem) > -1) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }, 
    postageOption: function(cost, options) {
        if (cost === 0) {
            return options.fn(this);
        } else {
        return options.inverse(this);
        }
    }
}

