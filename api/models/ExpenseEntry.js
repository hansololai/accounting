/**
 * ExpenseEntry.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	user: {model:'User',required:true},
  	category:{model:'Category',required:true,defaultsTo:1},
  	project:{model:'Project',required:true,defaultsTo:1},
  	amount:{type:'float',required:true,defaultsTo:0.0},
  	date:{type:'date',required:true,defaultsTo:function(){return new Date()}},
  	desc:{type:'string'},
  	checked:{type:'boolean',required:true,defaultsTo:false},
  	toJSON:function(){
		var obj = this.toObject();
      	if (obj.project instanceof Object){
      		obj.project=obj.project.id;
      	}
      	if (obj.category instanceof Object){
      		obj.category=obj.category.id;
      	}
      	return obj;
  	}
  },

};

