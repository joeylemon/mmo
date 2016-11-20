var PickupItemObjective = function(item, amount){
     this.item = item;
     this.amount = amount;
};

PickupItemObjective.prototype.getItem = function(){
	return this.item;
};

PickupItemObjective.prototype.getAmount = function(){
	return this.amount;
};

PickupItemObjective.prototype.getDefaultData = function(){
	return {items: 0};
};

PickupItemObjective.prototype.getAlert = function(){
	return "gather " + this.amount + " " + this.item + (this.amount != 1 ? "s" : "");
};
