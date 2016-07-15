/**
 * ExpenseEntryController
 *
 * @description :: Server-side logic for managing expenseentries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create:function(req,res){
		console.log(req.session);
		var userid=(req.session.user||{}).id;
		console.log(userid);
		var toCreate=Utilfunctions.prepareUpdate(req.body,['project','category','amount','date']);
		toCreate['user']=req.session.user;
		ExpenseEntry.create(toCreate).then(function(data){
			data.user=req.session.user;
			return res.json(data);
		}).error(function(err){
			return  Utilfunctions.errorHandler(err,res,"Create ExpenseEntry failed");		
		})
	},
	update:function(req,res){
		req.validate({id:'string'});
		ExpenseEntry.findOne(req.param('id')).then(function(model){
			if(!model) res.json(401,"Not found");
			if(model.validate&&req.session.user.rank<2){
				res.json(400,"Not authorized to changed validated entry");
			}else{
				var toUpdate=Utilfunctions.prepareUpdate(req.body,['project','category','amount','date','validate']);
				if(req.session.user.rank<2){
					delete toUpdate['validate']
				}
				ExpenseEntry.update(req.param('id'), toUpdate).then(function(data){
					if (data.length>0){
						return res.json(data[0])
					}
					return res.json(401,"Not found");
				}).error(function(err){
					return Utilfunctions.errorHandler(err,res,"Update failed");
				});
			}
		});
		
	}

};

