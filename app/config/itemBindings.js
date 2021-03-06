/**
 * HABmin - the openHAB admin interface
 *
 * openHAB, the open Home Automation Bus.
 * Copyright (C) 2010-2013, openHAB.org <admin@openhab.org>
 *
 * See the contributors.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or
 * combining it with Eclipse (or a modified version of that library),
 * containing parts covered by the terms of the Eclipse Public License
 * (EPL), the licensors of this Program grant you additional permission
 * to convey the resulting work.
 */

/** OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */


Ext.define('openHAB.config.itemBindings', {
    extend:'Ext.panel.Panel',
    icon:'images/chain.png',
    title: 'Bindings',
    defaults:{
        split:true
    },
    border:false,
    layout:'border',

    initComponent:function () {

        Ext.define('ItemBindingModel', {
            extend:'Ext.data.Model',
            fields:[
                {name:'binding'},
                {name:'config'}
            ]
        });

        // Create the data store
        var store = Ext.create('Ext.data.ArrayStore', {
            model:'ItemBindingModel'
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:[
                {
                    icon:'images/minus-button.png',
                    itemId:'delete',
                    text:'Delete Binding',
                    cls:'x-btn-icon',
                    disabled:true,
                    tooltip:'Delete the item binding',
                    handler:function () {
                        // Remove the record from the store
                        var record = list.getSelectionModel().getSelection()[0];
                        if (record == null)
                            return;
                        store.remove(record);

                        toolbar.getComponent('delete').disable();
                        properties.setProperty("String", "");
                    }
                },
                {
                    icon:'images/plus-button.png',
                    itemId:'add',
                    text:'Add New Binding',
                    cls:'x-btn-icon',
                    disabled:false,
                    tooltip:'Add a new item binding',
                    handler:function () {
                        var binding = "binding";
                        if(store.getCount() != 0)
                            binding = store.getAt(0).get("binding");

                        store.add({binding: binding, string:"New Binding"});
                        toolbar.getComponent('delete').enable();
                    }
                }
            ]
        });

        var list = Ext.create('Ext.grid.Panel', {
            store:store,
            region:"center",
            flex:1,
            header:false,
            split:true,
            tbar:toolbar,
            collapsible:false,
            multiSelect:false,
            columns:[
                {
                    text:'Binding',
                    flex:1,
                    dataIndex:'binding'
                },
                {
                    text:'Config',
                    flex:4,
                    dataIndex:'config',
                    renderer: Ext.util.Format.htmlEncode
                }
            ],
            listeners:{
                select:function (grid, record, index, eOpts) {
                    if (record == null)
                        return;

                    properties.setProperty("binding", record.get('binding'));
                    properties.setProperty("config", record.get('config'));

                    // Enable delete button
                    toolbar.getComponent('delete').enable();
                }
            }
        });

        var properties = Ext.create('Ext.grid.property.Grid', {
            title:'Properties',
            region:"south",
            flex:1,
            icon:'images/gear.png',
            hideHeaders:true,
            sortableColumns:false,
            nameColumnWidth:300,
            split:true,
            source:{
                binding:"",
                config:""
            },
            sourceConfig:{
                binding:{
                    displayName:"Binding Name"
                },
                config:{
                    displayName:"Binding String"
                }
            },
            viewConfig:{
                markDirty:false
            },
            tools:[
                {
                    type:'tick',
                    tooltip:'Update data',
                    handler:function (event, toolEl, panel) {
                        // Save button pressed - update the sitemap tree with the updated properties
                        var record = list.getSelectionModel().getSelection()[0];
                        if (record == null)
                            return;

                        var prop = properties.getStore();
                        record.set("binding", getPropertyValue(prop, "binding"));
                        record.set("config", getPropertyValue(prop, "config"));

                        // Function to get a property value given the name
                        // Returns null if property not found
                        function getPropertyValue(prop, name) {
                            var index = prop.find('name', name);
                            if (index != -1)
                                return prop.getAt(index).get('value');
                            else
                                return null;
                        }
                    }
                }
            ],
            listeners:{
                propertychange:function (source, recordId, value, oldValue, eOpts) {
                },
                beforeedit : function(editor, e) {
                }
            }
        });

        this.items = [list, properties];
        this.callParent();

        this.setBindings = function(bindings) {
            var rec = [];

            for(var cnt = 0; cnt < bindings.length; cnt++) {
                rec[cnt] = {};
                rec[cnt].id  = cnt;
                rec[cnt].binding = bindings[cnt].binding;
                rec[cnt].config = bindings[cnt].config;
            }
            store.loadData(rec);
        }

        // Get the list of binding configs
        this.getBindings = function() {
            var rec = [];

            var store = list.getStore();
            if(store == null)
                return rec;

            for(var cnt = 0; cnt < store.getCount(); cnt++) {
                rec[cnt] = {};
                rec[cnt].binding = store.getAt(cnt).get("binding");
                rec[cnt].config = store.getAt(cnt).get("config");
            }

            return rec;
        }

        // Get the binding name.
        // Assumes they are always the same
        this.getBindingName = function() {
            var rec = [];

            var store = list.getStore();
            if(store == null)
                return rec;

            if(store.getCount() == 0)
                return "";

            return store.getAt(0).get("binding");
        }

        // Return true if the binding data has changed
        this.isDirty = function() {
            var store = list.getStore();
            if(store == null)
                return false;

            var records = store.getRange();
            for(var i =0; i < records.length; i++){
                var rec = records[i];

                if(rec.dirty == true){
                    return true;
                }
            }

            return false;
        }
    }
})
;