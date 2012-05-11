var _getBox = function (val,widget,box) {
    if (widget.get("initialized") && !widget.get("rendered") && !widget._handling && widget.get("parent").get("populated")) {
        widget._handling = TRUE;
        widget.render();
        val = widget._state.get(box, VALUE);
    }
    return val;
};


/**
 * The Treeview component is a UI widget that allows users
 * to create a hierarchical-like structure of elements.
 * Extendes Y.WidgetParent, Y.WidgetChild, Y.WidgetHTMLRenderer
 * Treeview can be generated either by configuration object or exisiting markup to
 * provide progressive enhancement.
 * @module gallery-yui3treeview
 */
    Y.Treeview = Y.Base.create("treeview", WIDGET, [Y.WidgetParent, Y.WidgetChild, Y.WidgetHTMLRenderer], {
    
        /**
         * Property defining the markup template for bounding box.
         *
         * @property BOUNDING_TEMPLATE
         * @type String
        */
        BOUNDING_TEMPLATE : '<ul id="{{id}}" class="{{boundingClasses}}">{{{contentBox}}}</ul>',
        
        /**
         * Property defining the markup template for content box.          
         *
         * @property CONTENT_TEMPLATE
         * @type String
        */
        
        
        /**
         * Property defining the markup template for the trewview label .
         *
         * @property TREEVIEWLABEL_TEMPLATE
         * @type String
        */
        TREEVIEWLABEL_TEMPLATE : "<a class='{{{treelabelClassName}}}' role='treeitem' tabindex='0'><span class={{{labelcontentClassName}}}>{{{label}}}</span></a>",
        
        /**
         * Property defining the markup template for the expand controller.
         *
         * @property EXPANDCONTROL_TEMPLATE
         * @type String
        */
        EXPANDCONTROL_TEMPLATE : "<span class='{{{labelcontentClassName}}}'>{{{label}}}</span>",
        
               
        /**
         * Flag to indicate whether a content Box/Bounding box has been returned from the getter attribute.
         *
         * @property _handling
         * @type Boolean
        */
        
        /**
         * The template for a branch element.
         *
         * @property branchTemplate
         * @type String
        */

        /**
         * Initializer lifecycle implementation for the Treeview class. 
         * <p>Registers the Treeview instance. It subscribes to the onParentChange 
         *    event which is triggered each time a new tree is added.</p>
         * <p>It publishes the toggleTreeState event, which gets fired everytime a node is
         *    collapsed/expanded</p>
         *
         * @method initializer
         * @public
         * @param  config {Object} Configuration object literal for the widget
         */
        initializer : function (config) {
            this.publish('toggleTreeState', { 
                defaultFn: this.toggleTreeState
            });
        },
        
        
        /**
         * renderUI implementation
         *
         * Creates a visual representation of the treeview based on existing parameters. 
         * @method renderUI
        */  
        renderUI: function (contentBuffer) {
            var label = this.get("label"),
                labelContent,
                isBranch = this.get("depth") > -1,
                treelabelClassName = this.getClassName("treelabel"),
                labelcontentClassName = classNames.labelcontent;
                
                          
            this.BOUNDING_TEMPLATE = isBranch ? '<li id="{{{id}}}" role="presentation" class="{{{boundingClasses}}}">{{{contentBox}}}</li>' : '<ul id="{{{id}}}" role="tree" class="{{{boundingClasses}}}">{{{contentBox}}}</ul>';
            this.CONTENT_TEMPLATE = isBranch ? '<ul id="{{id}}" role="group" class="{{{contentClasses}}}">{{{content}}}</ul>' : null;
            labelContent = Y.Handlebars.render(this.TREEVIEWLABEL_TEMPLATE, {label:label, treelabelClassName : treelabelClassName, labelcontentClassName : labelcontentClassName});
            contentBuffer.push(labelContent);
        },
        
        /**
        * Utility method to add the boundingClasses and contentClasses property values
        * to the Handlebars context passed in. Similar to _renderBoxClassNames() on
        * the Node based renderer.
        *
        * @method _renderBoxClassNames
        * @param {Object} context The Handlebars context object on which the
        * boundingClasses and contentClasses properties get added.
        */
        _renderBoxClassNames: function(context) {
            var classes = this._getClasses(),
                cl,
                i,
                contentClass = this.getClassName(CONTENT),
                boundingClasses = [];
                
                boundingClasses[boundingClasses.length] = Widget.getClassName();
                
                
            for (i = classes.length-3; i >= 0; i--) {
                cl = classes[i];
                boundingClasses[boundingClasses.length] = Y.ClassNameManager.getClassName(cl.NAME.toLowerCase()) || this.getClassName(cl.NAME.toLowerCase());
            }
            
            
            
            if (this.CONTENT_TEMPLATE === null) {
                boundingClasses.push(contentClass);
                boundingClasses.push(classNames.collapsed);
            } else {
                context.contentClasses = contentClass + " " + classNames.collapsed;
            }
            
            context.boundingClasses = boundingClasses.join(" ");
        },

        /**
         * bindUI implementation
         *
         * Assigns listeners to relevant events that change the state
         * of the treeview.
         * @method bindUI
        */ 
        bindUI: function() {
            //only attaching to the root element
            if (this.isRoot()) {
                this.get("boundingBox").on("click",this._onViewEvents,this);
                this.get("boundingBox").on("keydown",this._onViewEvents,this);

            }
        },
        
        /**
         * Handles all the internal treeview events. In this case, all it does it fires the
         * collaped/expand event when a treenode is clicked
         * @method onViewEvents
         * @protected
         */
        _onViewEvents : function (event) {
            var target = event.target,
                keycode = event.keyCode,
                classes,
                className,
                i,
                cLength;
                
            
            classes = target.get("className").split(" ");
            cLength = classes.length;
            
            for (i=0;i<cLength;i++) {
                className = classes[i];
                switch (className) {
                    case classNames.labelcontent :
                        this.fire('toggleTreeState',{actionNode:target});
                        break;
                    case classNames.treeLabel :
                        if (keycode === 39) {
                            this.fire('toggleTreeState',{actionNode:target});
                        } else if (keycode === 37) {
                            this.fire('toggleTreeState',{actionNode:target});
                        }
                        break;
                }
            }
  
        },
    
       /**
        * Renders all child Widgets for the parent.  
        * <p>
        * This method in invoked after renderUI is invoked for the Widget class
        * using YUI's aop infrastructure. 
        * OVERWRITE : Overwritting for string rendering mode, if lazyLoad is enabled
        * it will not prepare the children strings until is needed.
        * </p>
        * @param {Object} The contentBuffer 
        * @method _renderChildren
        * @protected
        */ 
        _renderChildren: function (contentBuffer) {
            var childrenHTML;
            
            if (!this.get("lazyLoad")) {
                childrenHTML = this._getChildrenHTML(this);
                contentBuffer.push(childrenHTML);
            }

        },
        
       /**
        * Renders all child Widgets for the parent.  
        * <p>
        * Giving a tree, it concatenates all the strings for it's children
        * </p>
        * @param {Object} The tree we are trying to obtain the children from
        * @method getChildrenHTML
        * @protected
        */ 

        _getChildrenHTML : function (tree) {
             var childrenHTML = "";

            tree.each(function (child) {
                childrenHTML += child.renderHTML();
            });
            
            return childrenHTML;

        },
        
      /**
        *  
        * <p>
        * This method in invoked on demand when children are required
        * to display
        * </p>
        * @method _lazyRenderChildren
        * @param {Object} treeWidget, the widget Object 
        * @param {Y.Node} treeNode 
        * @protected
        */ 
        _lazyRenderChildren : function (treeWidget,treeNode) {
            
            var childrenHTML = treeWidget._getChildrenHTML(treeWidget);
            
            treeNode.append(childrenHTML);
            treeWidget.set("populated",true);
            
        },
        
                       
        /**
         * Toggles the collapsed/expanded class
         * @method _toggleTreeState
         * @protected
         */
       toggleTreeState : function (target) {
            var treeNode = target.actionNode.ancestor('.'+ classNames.treeviewcontent),
                treeWidget = Y.Widget.getByNode(target.actionNode),
                isPopulated = treeWidget.get("populated");
            
            if (this.get("lazyLoad") && !isPopulated) {
                treeWidget._lazyRenderChildren(treeWidget,treeNode);
                treeWidget.set("populated",true);
            }
            
            treeWidget.set("collapsed", !treeWidget.get("collapsed"));        
            treeNode.toggleClass(classNames.collapsed);
        }
    
    }, {
        ATTRS: {
            /**
             * The label attribute for the tree.
             *
             * @attribute label
             * @type String
             */
            label : {
                value:""
            },
            
             
            /**
             * Configuration to set lazyLoad enabled. When enabled, all the children rendering will be done on demand.
             *
             * @attribute _populated
             * @type Boolean
            */
            
            lazyLoad : {
                writeOnce : "initOnly"
            },
            
            
            /**
             * Attribute to indicate whether a tree has been populated with it's children or not.
             *
             * @attribute populated
             * @type Boolean
            */

            populated : {
                readOnly : true
            },
            
            /**
             * Attribute to indicate whether a tree is in a collapsed state or not
             *
             * @attribute collapsed
             * @type Boolean
            */
            
            collapsed : {},
            
            /**
             * The default children type.
             *
             * @attribute defaultChildType
             * @type String
             */
            defaultChildType: {  
                value: "TreeLeaf"
            },
            
            /**
             * Specifying a custom getter for the Bounding box so that
             * it's only rendered when needed. 
             * @attribute boundingBox
             * @type BoundingBox
             */
            boundingBox: {
                getter : function(val) {
                    if (this.get("initialized") && !this.get("rendered") && !this._handling && this.get("populated")) {
                        this._handling = TRUE;
                        this.render();
                        val = this._state.get(BOUNDING_BOX, VALUE);
                    }
                    return val;
                }
            },
            
            /**
             * Specifying a custom getter for the Content box so that
             * it's only rendered when needed. 
             * @attribute contentBox
             * @type contentBox
             */
            contentBox: {
                getter : function(val) {
                    if (this.get("initialized") && !this.get("rendered") && !this._handling && this.get("populated")) {
                        this._handling = TRUE;
                        this.render();
                        val = this._state.get(CONTENT_BOX, VALUE);
                    }
                    return val;
                }
            }
        }
    });
    
    /**
    *  Treeleaf component of Treeview. Defines a Y.Widget that extends from Y.WidgetChild,
    * this is the default child type of a tree unless specified otherwise.
    * @module Y.TreeLeaf
    */
    Y.TreeLeaf = Y.Base.create("treeleaf", WIDGET, [Y.WidgetChild,Y.WidgetHTMLRenderer], {
    
    
        BOUNDING_TEMPLATE : '<li id="{{id}}" role="treeitem" class="{{boundingClasses}}" tabindex="0">{{{contentBox}}}</li>',
    
        CONTENT_TEMPLATE : null,
    
        /**
         * renderUI implementation
         *
         * Creates a visual representation of the treeview based on existing parameters. 
         * @method renderUI
        */  
        renderUI: function (contentBuffer) {
            contentBuffer.push(this.get("label"));
        }
    }, {
    
        ATTRS: {
            /**
             * The label attribute for the tree.
             *
             * @attribute label
             * @type String
             */
            label: {},
            
            /**
             * Specifying a custom getter for the Bounding box so that
             * it's only rendered when needed. 
             * @attribute boundingBox
             * @type BoundingBox
             */
            boundingBox: {
                getter : function(val) {
                    if (this.get("initialized") && !this.get("rendered") && !this._handling && this.get("parent").get("populated")) {
                        this._handling = TRUE;
                        this.render();
                        val = this._state.get(BOUNDING_BOX, VALUE);
                    }
                    return val;
                }
            },
            
            /**
             * Specifying a custom getter for the Content box so that
             * it's only rendered when needed. 
             * @attribute contentBox
             * @type contentBox
             */
            contentBox: {
                getter : function(val) {
                    if (this.get("initialized") && !this.get("rendered") && !this._handling && this.get("parent").get("populated")) {
                        this._handling = TRUE;
                        this.render();
                        val = this._state.get(CONTENT_BOX, VALUE);
                    }
                    return val;
                }
            }

        }
    });
