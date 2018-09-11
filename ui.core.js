
UI = { };

var elementIdIterator = 1;

UI.Element = class {
	
	constructor(opt) {

		this.id = 'element-' + elementIdIterator;
		this.opt = opt || { };
		elementIdIterator ++;
	}

	template() {
		return '';
	}

	getElement() {
		if(!this.el) {			
			this.el = document.getElementById(this.id);
		}
		return this.el
	}

	afterCreateElement(el) {
		if(this.opt.class) {
			el.setAttribute('class', this.opt.class);
		}
		if(this.opt.draggable) {
			el.setAttribute('draggable', true);
			el.addEventListener("dragstart", this.opt.draggable, false);
		}
		if(this.opt.droppable) {
			el.addEventListener("dragover", this.opt.droppable.bind(null, 'dragover'), false);
			el.addEventListener("drop", this.opt.droppable.bind(null, 'drop'), false);
			el.addEventListener("dragleave", this.opt.droppable.bind(null, 'dragleave'), false);
		}
		
	}

	afterPlaceElement() {
	}

	createElement() {
		var tag = this.opt.tag || 'div';
		var el = this.el = document.createElement(tag);
		el.setAttribute('id', this.id);
		el.innerHTML = this.template();
		this.afterCreateElement(el);
	}

	place(selector) {

		var placeholder;
		if(selector instanceof UI.Element) {
			placeholder = selector.getElement();
		}
		else {
			placeholder = document.querySelector(selector);
		}

		this.createElement();
		
		placeholder.appendChild(this.el);
		this.afterPlaceElement();
	}

	remove() {
		this.el.parentNode.removeChild(this.el);
	}

	set disabled(val) {
		if(val) {
			this.el.setAttribute('disabled', 'disabled');
		}
		else {
			this.el.removeAttribute('disabled');
		}
	}
}

UI.Button = class extends UI.Element {

	constructor(caption, callback, opt) {
		opt = opt || {};
		opt.tag = 'button';
		super(opt);
		this.caption = caption;
		this.callback = callback;
	}

	template() {
		return this.caption;
	}

	afterCreateElement(el) {
		super.afterCreateElement(el);
		el.addEventListener("click", this.callback);
	}

}

UI.Caption = class extends UI.Element {

	constructor(caption, opt) {
		super()		
		this.caption = caption;
		this.opt = opt || { };
	}

	template() {
		return '<span>' + this.caption + '</span>';
	}

	afterCreateElement(el) {
		el.classList.add('caption');
	}

	afterPlaceElement() {
		if(this.opt.deleteButton) {
			var button = new UI.Button('x', this.opt.deleteButtonCallback);
			button.place(this);
		}
	}

}

UI.ComboBox = class extends UI.Element {

	constructor(list, opt) {
		opt = opt || { };
		opt.tag = 'select';
		super(opt);
		this.list = list;		
	}

	afterCreateElement(el) {
		super.afterCreateElement(el);
		this.items = [];
		for(var i = 0, list = this.list, l = list.length; i < l; i++) {
			var item = list[i];
			var itemElement = new UI.ComboBox.Item(item);
			itemElement.place(this)
			this.items.push(itemElement);
		}
	
		var self = this;		
		el.addEventListener("change", function() {
			self.opt.onChange(self.el.value);
		});
	}

	get value() {
		return this.el.value;
	}

	set value(val) {
		for(var i = 0, list = this.items, l = list.length; i < l; i++) {
			var item = list[i];
			item.el.removeAttribute('selected');
		}
		this.el.querySelector('option[value="' + val + '"]').setAttribute('selected', 'selected');
	}
}

UI.ComboBox.Item = class extends UI.Element {
	constructor(item) {
		super({tag:'option'});
		this.item = item;
	}
	afterCreateElement(el) {
		el.setAttribute('value', this.item.id);		
		if(this.item.disabled) {
			el.setAttribute('disabled', 'disabled');			
		}
		if(this.item.selected) {
			el.setAttribute('selected', 'selected');
		}
	}
	template() {
		return this.item.caption;
	}
}
