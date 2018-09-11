

UI.Product = class extends UI.Element {

	constructor(product, count, opt) {
		opt = opt || {};
		super(opt);		
		this.product = product;
		this._count = count;
	}

	set count (count_) {
		this._count = count_;
		var el = this.el.querySelector(".fl.count");
		el.innerHTML = '' + count_;
		this.checkForZero();
	}

	checkForZero() {
		if(this._count < 1) {
			this.el.classList.add('zero');
		}
		else {
			this.el.classList.remove('zero');
		}
	}

	get count () {
		return this._count;
	}

	template() {
		return '<div class="fl caption">' + this.product.name + '</div><div class="fl count">' + this.count + '</div><div class="cb"></div>';
	}

	afterCreateElement(el) {
		super.afterCreateElement(el);
		el.classList.add('product');
		this.checkForZero();
	}

}

UI.Storehouse = class extends UI.Element {

	constructor(desc) {
		super();
		this.products = desc.products;
		this.productById = { };
	}

	template() {
		return '';
	}

	afterCreateElement(el) {
		el.classList.add('storehouse');
	}

	afterPlaceElement() {
		this.caption = new UI.Caption('Склад');
		this.caption.place(this);

		this.goodsWraper = new UI.Element({ class: 'goods' });
		this.goodsWraper.place(this)

		for(var id in this.products) {
			var item = this.products[id];
			var info = UI.goods.getById(item.id);
			(function (productId, goodsWraper, productById) {
				var product;
				product = new UI.Product(info, item.count, { draggable: function(event) {
					if(product.count > 0) {
						UI.dragProductId = productId;
					}
					else {
						event.preventDefault();
					}					
				} });
				product.place(goodsWraper);
				productById[productId] = product;
			})(item.id, this.goodsWraper, this.productById)
		}

		new UI.Element({class:'cb'}).place(this.goodsWraper);
	}

	getProduct(productId) {
		if(!(productId in this.productById)) {
			return null;
		}
		return this.productById[productId];
	}
}

var shopTypes = {
	food: { caption: 'Продукт.' },
	goods: { caption: 'Хоз.' },
	construction: { caption: 'Строит.' },
};

UI.Shop = class extends UI.Element {

	constructor(desc) {
		super();
		var self = this;
		this.opt.droppable = function(eventName, event) {
			switch(eventName) {
				case "dragover": {
					// check for product type
					var p = UI.goods.getById(UI.dragProductId);
					if(self.types.indexOf(p.type) !== -1) {
						self.el.classList.add('green');
						event.preventDefault();
					}
				}
				break;
				case "dragleave": {
					self.el.classList.remove('green');
				}
				break;
				case "drop": {
					self.el.classList.remove('green');
					ajax('/api/transferProduct.php', { shopId: self.id, productId: UI.dragProductId });
				}
				break;
			}
		};

		this.id = desc.id;
		this.types = desc.types;	
		this.products = desc.products;	
	}

	afterCreateElement(el) {
		super.afterCreateElement(el);
		el.classList.add('shop');
	}

	afterPlaceElement() {
		super.afterPlaceElement();
		var caption = [];
		for(var i = 0, t = this.types, l = t.length; i < l; i++) {
			caption.push(shopTypes[t[i]].caption);
		}

		var self = this;
		var caption = caption.join('-');
		this.caption = new UI.Caption(
			caption, {
				deleteButton: true,
				deleteButtonCallback: function() {
					if(confirm('Удалить магазин ' + caption)) {
						ajax('/api/deleteShop.php', { shopId: self.id });
					}
				}
			}
		);
		this.caption.place(this);

		this.productById = { };
		for(var i = 0, p = this.products, l = p.length; i < l; i++) {
			var info = p[i];
			var product = this.addProduct(info.id);
			product.count = info.count;
		}
	}

	getOrCreateProduct(productId) {
		if(!(productId in this.productById)) {
			this.addProduct(productId);
		}
		return this.productById[productId];
	}

	addProduct(id) {
		var product = new UI.Product(UI.goods.getById(id), 0);
		product.place(this);
		this.productById[product.product.id] = product;
		return product;
	}

}

class Goods {
	constructor(desc) {
		var m = { };
		for(var i = 0, l = desc.length; i < l; i++) {
			var item = desc[i];
			m[item.id] = item;
		}
		this.byId = m;
	}

	getById(id) {
		return this.byId[id];
	}
}
					
function updateShopControl() {
	if(UI.shopCount >= 20) {
		// disable addshop control
		UI.shopTypeComboBox.disabled = true;
		UI.addShopButton.disabled = true;
	}
	else {
		// enable addshop control
		UI.shopTypeComboBox.disabled = false;
		if(UI.shopTypeComboBox.value == 'none') {
			UI.addShopButton.disabled = true;
		}
		else {
			UI.addShopButton.disabled = false;
		}
	}
}

var g_spa_start = coroutine(function*(g) {

	new UI.Button('Очистить', function() { ajax("/api/restart.php") }, { class: 'clear' }).place('body');

	var wrap = null;

	while(true) {

		// получим текущие состояние
		var data = yield ajax("/api/summary.php", g.resume);
		if(wrap) {
			wrap.remove();
		}


		// создадим все нужные контролы и наполним		
		var goods = new Goods(data.goods);
		UI.goods = goods;

		wrap = new UI.Element({ class: 'wrap' });
		wrap.place('body');

		var storehouse = new UI.Storehouse(data.storehouse);
		storehouse.place(wrap);

		var controlWrapper = new UI.Element({ class: 'controlWrapper' });
		controlWrapper.place(wrap);

		var items = [{id:'none',caption:'Выберите тип магазина',selected:true}];
		for(var i = 0, list = data.shopTypes, l = list.length; i < l; i++) {
			var item = list[i];
			var caption = [ ];
			for(var j = 0, k = item.length; j < k; j++) {
				caption.push(shopTypes[item[j]].caption);
			}
			items.push({id: item.join(','), caption: caption.join('-')});
		}
		UI.shopTypeComboBox = new UI.ComboBox(items, { onChange: function(value) {
			if(value == 'none') {
				UI.addShopButton.el.setAttribute('disabled', 'disabled');
			}
			else {
				UI.addShopButton.el.removeAttribute('disabled');
			}
		}, class: 'shop-selector' });
		UI.shopTypeComboBox.place(controlWrapper);

		UI.addShopButton = new UI.Button('Добавить магазин', function() {
			ajax('/api/addShop.php', { shopType: UI.shopTypeComboBox.value });
			UI.shopTypeComboBox.value = 'none';
		}, { class: 'add-shop' });

		UI.addShopButton.place(controlWrapper);
		UI.addShopButton.disabled = true;

		new UI.Element({class:'cb'}).place(controlWrapper);

		var shopsWrapper = new UI.Element();
		shopsWrapper.place(wrap);

		UI.shops = { };
		for(var i = 0, shops = data.shops, l = shops.length; i < l; i++) {
			var shop = shops[i];
			var shopElement = new UI.Shop(shop);
			UI.shops[shopElement.id] = shopElement;
			shopElement.place(shopsWrapper);
		}

		UI.shopCount = data.shops.length;
		updateShopControl();
		
		new UI.Element({class:'cb'}).place(wrap);

		// основной цыкл обработки
		var restart = true;
		while(restart) {
			yield sleep(200 + Math.random() * 700, g.resume);
			var data = yield ajax("/api/changes.php", g.resume);
			var events = data.events;
			for(var i = 0, l = events.length; i < l; i++) {
				var event = events[i];
				var eventName = event[0];
				switch(eventName) {

					case "setProduct": {
						var shopId = event[1], productId = event[2], props = event[3];
						var product;
						if(shopId > 0) {
							var shop = UI.shops[shopId];					
							product = shop.getOrCreateProduct(productId);
						}
						else {
							product = storehouse.getProduct(productId);
						}
						if(product) {
							for(var propName in props) {
								var propVal = props[propName];
								switch(propName) {
									case "count": {
										product.count = propVal;
									}
									break;
								}
							}
						}
					}
					break;

					case "delProduct": {
						var shopId = event[1], productId = event[2];
						var shop = UI.shops[shopId];					
						var product = shop.getOrCreateProduct(productId);
						product.remove();
					}
					break;				

					case "delShop": {
						var shopId = event[1];
						var shop = UI.shops[shopId];
						shop.remove();
						delete UI.shops[shopId];
						UI.shopCount --;
						updateShopControl();
					}
					break;

					case "addShop": {
						var types = event[1];
						var shopElement = new UI.Shop({ id: event[2], types: types, products: [] });
						UI.shops[shopElement.id] = shopElement;
						shopElement.place(shopsWrapper);
						UI.shopCount ++;
						updateShopControl();
					}
					break;

					case "restart": {
						restart = false;					
					}
				}
				if(!restart) {
					break;
				}
			}

		}

	}

});

function spa_start() {
	g_spa_start(function(err, result) {
		if(err) {
			console.log(err);
		}
	})
}

document.addEventListener("DOMContentLoaded", spa_start);
