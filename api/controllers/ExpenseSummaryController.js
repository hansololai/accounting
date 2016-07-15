/**
 * ExpenseSummaryController
 *
 * @description :: Server-side logic for managing Expensesummaries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _=require('lodash')
module.exports = {
	index: function(req,res){

		function getWeekOfMonth(date){
			return Math.floor(new Date(date).getDay()/7)
		}
		ExpenseEntry.find().populateAll().then(function(data){
			var row=_.groupBy(data,function(i){
			 	return (i['project']||{}).name;
			});
			var allrows=_.map(row,function(r){
				var subgroup=_.groupBy(r,function(i){
					console.log(i);
					return (i['category']||{}).name+'_'+ getWeekOfMonth(i['date']);
				});
				subgroup=_.map(subgroup,function(i){
					// do the sum 
					return {
						category:(i[0]['category']||{}).name||"undefined",
						week:getWeekOfMonth(i[0]['date']),
						total:_.reduce(i,function(sum, n){return sum+n.amount},0)
					};
				});
				var toReturn={name:(r[0]['project']||{}).name};
				console.log(subgroup);
				_.each(subgroup,function(i){
					toReturn[i['category']+i['week']]=i['total'];
				})

				return toReturn;
			});
			return res.json(allrows);
		});
	}	
};

