<?php

class Goods {
	private static $list = null;
	public static function getList() {
		if(self::$list === null) {
			self::$list = [
				new Product(Product::Bread),
				new Product(Product::Milk),
				new Product(Product::Meat),
				new Product(Product::Soap),
				new Product(Product::Vegetables),
				new Product(Product::Fruit),
				new Product(Product::Bricks),
				new Product(Product::Nails),
				new Product(Product::Plywood),
				new Product(Product::Concrete),
				new Product(Product::Shampoo),
				new Product(Product::Bucket),
				new Product(Product::Mop),
				new Product(Product::IceCream),
				new Product(Product::Сhocolate),
			];		
		}
		return self::$list;
	}
}