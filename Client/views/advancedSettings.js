"use strict";
var _=require('lodash');
var Promise=require('bluebird');
var moment=require('moment');
var $ = require('../jquery');
var Backgrid=require('../backgrid');
var Backbone= require('../backbone');
var Obiwang = require('../models');
var validator=require('../validator.js');
var util=require('../util');
var BackgridCells=require('../backgrid.cell.js');
var Backform=require('../backform');
var JST=require('../JST');
var main=require('./data.js');
var base=require('./base');
var Sidebar=require('./sidebar');
var Dropzone=require('dropzone');


var MenuTitle={
	'ExpenseSummary':'报账总结',
	'ExpenseReport':'报账',
	'Project':'项目',
	'Category':'类别',
	//'SalesComissionLookUp':'销售佣金设置',
	//'MonthlyGoal':'销售每月目标',
	'TableEditor':'其他设置'
}
var AdvancedSettings={
	ExpenseSummary:main.baseDataView.extend({
		collectionName:'SimplePageCollection',
		collectionUrl:'/ExpenseSummary/',
		title:'报销总结',
		minScreenSize:0,
		renderOptions:{nofield:true},
		simpleFilter:true,
		templateName:'default',
		constructColumns:function(){
			var self=this;
			return util.ajaxGET('/Category/').then(function(category){
				self.columns=[];
				self.columns[0]={name:'name',label:'Name',editable:false,cell:'string'};
				self.filterFields=['name'];
		
				for(var i=0;i<5;i++){
					_.each(category,function(e){
						self.columns.push({name:e['name']+i,label:e['name']+i,editable:false,cell:'string'});
						self.filterFields.push(e['name']+i);
					})
				}
			});
		},
		events:{
	        'click  button.button-alt': 'refetch',
			'click  button.button-save': 'save',
	    },
	    destroy: function () {
	        this.$el.removeClass('active');
	        this.undelegateEvents();
	    },
	    afterRender:function(){
	        this.$el.attr('id', this.id);
	        this.$el.addClass('active');
	    }
	}),
	ExpenseReport:main.baseDataView.extend({
		collectionName:'SimplePageCollection',
		collectionUrl:'/ExpenseEntry/',
		title:'报销',
		minScreenSize:0,
		renderOptions:{nofield:true},
		simpleFilter:true,
		filterFields:['desc','amount','date','category','project'],
		templateName:'default',
		constructColumns:function(){
			var self=this;
			var usercell=Backgrid.Cell.extend({
			   render: function () {
			   	var u=this.model.get('user');
			    this.$el.html(u.nickname);
			    this.delegateEvents();
			    return this;
			  }
			  })

			return Promise.all([util.ajaxGET('/Project/'),util.ajaxGET('/Category/')]).spread(function(projects,category){
				var projectcell=BackgridCells.SelectCell({nullable:true,name:"Project",values:_.map(projects,function(e){return [e.name,e.id]})});
            	var categorycell=BackgridCells.SelectCell({nullable:true,name:"Category",values:_.map(category,function(e){return [e.name,e.id]})});
            
				self.columns=[
					{name:'date',label:'Date',editable:true,cell:'date'},
					{name:'user',label:'User',editable:false,cell:usercell},
					{name:'category',label:'Category',editable:true,cell:categorycell},
					{name:'project',label:'Project',editable:true,cell:projectcell},
					{name:'desc',label:'细节',editable:true,cell:'string'},
					{name:'amount',label:'Amount',editable:true,cell:'number'},
					
				]
				self.selectFields=[
					{name:'category',label:'Category',options:_.map(projects,function(e){return [e.name,e.id]})},
					{name:'project',label:'Project',options:_.map(category,function(e){return [e.name,e.id]})}
					];

			})
		},
		events:{
	        'click  button.button-alt': 'refetch',
	        'click .button-add':'addnew',
			'click  button.button-save': 'save',
	    },
	    destroy: function () {
	        this.$el.removeClass('active');
	        this.undelegateEvents();
	    },
	    afterRender:function(){
	        this.$el.attr('id', this.id);
	        this.$el.addClass('active');
	        $('.page-actions').prepend('<button class="button-add">Add New</button>');
	    },
	    newModel:function(){
        	return new Obiwang.Models.syncModel({user:1},{_url:'/ExpenseEntry/'});
    	},


	}),
	Category:main.baseDataView.extend({
		collectionName:'SimplePageCollection',
		collectionUrl:'/Category/',
		title:'类别',
		minScreenSize:0,
		renderOptions:{nofield:true},
		templateName:'default',
		constructColumns:function(){
			this.columns=[
				{name:'name',label:'Name',editable:true,cell:'string'},
			]
			return Promise.resolve({});
		},
		events:{
	        'click  button.button-alt': 'refetch',
	        'click .button-add':'addnew'
	    },
	    destroy: function () {
	        this.$el.removeClass('active');
	        this.undelegateEvents();
	    },
	    afterRender:function(){
	        this.$el.attr('id', this.id);
	        this.$el.addClass('active');
	        $('.page-actions').prepend('<button class="button-add">Add New</button>');
	    },
	    newModel:function(){
        	return new Obiwang.Models.syncModel(null,{_url:'/Category/'});
    	},

	}),
	Project:main.baseDataView.extend({
		collectionName:'SimplePageCollection',
		collectionUrl:'/Project/',
		title:'项目',
		minScreenSize:0,
		renderOptions:{nofield:true},
		templateName:'default',
		constructColumns:function(){
			this.columns=[
				{name:'name',label:'Name',editable:true,cell:'string'},
			]
			return Promise.resolve({});
		},
		events:{
	        'click  button.button-alt': 'refetch',
	        'click .button-add':'addnew'
	    },
	    destroy: function () {
	        this.$el.removeClass('active');
	        this.undelegateEvents();
	    },
	    afterRender:function(){
	        this.$el.attr('id', this.id);
	        this.$el.addClass('active');
	        $('.page-actions').prepend('<button class="button-add">Add New</button>');
	    },
	    newModel:function(){
        	return new Obiwang.Models.syncModel(null,{_url:'/Project/'});
    	},

	}),
	TableEditor:main.basePaneView.extend({
	    templateName:'dateTableView',
	    title:'表格修改',
	    initialize: function (options) {
	        this.rank=$('#rank').text();
	        this.render({title:this.title,options:this.renderOptions});
	    },
	    destroy: function () {
	        this.$el.removeClass('active');
	        this.undelegateEvents();
	    },
	    afterRender:function(){
	        this.$el.attr('id', this.id);
	        this.$el.addClass('active');
	    },
	})
};
var AdvancedSettingsView = base.extend({
    initialize: function (options) {
        $(".settings-content").removeClass('active');
        this.sidebar = new Sidebar({
            el: '.settings-sidebar',
            pane: options.pane,
            submenu:'advancedSettings',
            MenuViews:AdvancedSettings,
            MenuTitle:MenuTitle
        });
        this.render();
        this.listenTo(Wholeren.router, 'route:advancedSettings', this.changePane);
        
    },
    changePane: function (pane) {
        if (!pane) {
            return;
        }
        this.sidebar.showContent(pane);
    },
    render: function () {
        this.sidebar.render({title:'Advanced Settings'});

    }
});
module.exports=AdvancedSettingsView;