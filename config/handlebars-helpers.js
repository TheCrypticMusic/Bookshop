module.exports = {
    indexOf: function(index, options){
      if (index === 0) {
        return options.fn(this);
        }
      return options.inverse(this);
    },
    bar: function(){
      return "BAR!";
    }
  }