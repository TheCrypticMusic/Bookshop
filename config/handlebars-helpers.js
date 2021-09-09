module.exports = {
    indexOf: function(index, options){
      if (index === 0) {
        return options.fn(this);
        }
      return options.inverse(this);
    },
    padNumber: function(price){
      return price.toFixed(2)
    }
  }
