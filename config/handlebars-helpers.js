module.exports = {
    indexOf: function(index, options){
      if (index === 0) {
        return options.fn(this);
        }
      return options.inverse(this);
    },
    padNumber: function(price){
      return price.toFixed(2)
    },
    bestsellers: function(cat, options) {
      if ("Bestsellers" == cat) {
        return options.fn(this);
        }
      return options.inverse(this);
    },
    recentlyAdded: function(cat, options) {
      if ("Recently Added" == cat) {
        return options.fn(this);
        }
      return options.inverse(this);
    },ifEquals: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  }
}

