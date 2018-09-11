<?php

/*
овощи, фрукты, кирпичи, гвозди, фанера, бетон,
шампунь, ведро, швабра, мороженое, шоколад.
*/


class Product implements JsonSerializable {

	const Food = "food";
	const Goods = "goods";
	const Construction = "construction";

	static public function getTypes() {
		return [ Product::Food, Product::Goods, Product::Construction ];
	}

	const Bread = 1;
	const Milk = 2;
	const Meat = 3;
	const Soap = 4;
	const Vegetables = 5;
	const Fruit = 6;
	const Bricks = 7;
	const Nails = 8;
	const Plywood = 9;
	const Concrete = 10;
	const Shampoo = 11;
	const Bucket = 12;
	const Mop = 13;
	const IceCream = 14;
	const Сhocolate = 15;

	private static $productDescription = [
		Product::Bread => [
			'type'	=> Product::Food,
			'name'	=> 'Хлеб',
		],
		Product::Milk => [
			'type'	=> Product::Food,
			'name'	=> 'Молоко',
		],
		Product::Meat => [
			'type'	=> Product::Food,
			'name'	=> 'Мясо',
		],
		Product::Soap => [
			'type'	=> Product::Goods,
			'name'	=> 'Мыло',
		],
		Product::Vegetables => [
			'type'	=> Product::Food,
			'name'	=> 'Овощи',
		],
		Product::Fruit => [
			'type'	=> Product::Food,
			'name'	=> 'Фрукты',
		],
		Product::Bricks => [
			'type'	=> Product::Construction,
			'name'	=> 'Кирпичи',
		],
		Product::Nails => [
			'type'	=> Product::Construction,
			'name'	=> 'Гвозди',
		],
		Product::Plywood => [
			'type'	=> Product::Construction,
			'name'	=> 'Фанера',
		],
		Product::Concrete => [
			'type'	=> Product::Construction,
			'name'	=> 'Бетон',
		],
		Product::Shampoo => [
			'type'	=> Product::Goods,
			'name'	=> 'Шампунь',
		],
		Product::Bucket => [
			'type'	=> Product::Goods,
			'name'	=> 'Ведро',
		],
		Product::Mop => [
			'type'	=> Product::Goods,
			'name'	=> 'Швабра',
		],
		Product::IceCream => [
			'type'	=> Product::Food,
			'name'	=> 'Мороженое',
		],
		Product::Сhocolate => [
			'type'	=> Product::Food,
			'name'	=> 'Шоколад',
		],
                

	];

	private static $listByType = [ ];

	static public function getListByType($type) {

		if(!isset(Product::$listByType[$type])) {
			$list = [];
			foreach(Product::$productDescription as $id => $desc) {
				if($desc['type'] === $type) {
					$list[] = new Product($id);
				}
			}
			Product::$listByType[$type] = $list;
		}

		return Product::$listByType[$type];
		
	}

	static public function getListByTypes($types) {
		$list = [];
		foreach($types as $type) {
			$list = array_merge($list, Product::getListByType($type));
		}
		return $list;
	}

	public function __construct($id) {
		$this->id = $id;
		$desc = self::$productDescription[$id] ?? [
			'type'	=> 'none',
			'name'	=> 'none',
		];
		$this->type = $desc['type'];
		$this->name = $desc['name'];
	}

	function setProps($props) {
		foreach($props as $name => $val) {
			switch($name) {

				case "count": 
				$this->count = $val;
				break;

				case "zeroTime": 
				$this->zeroTime = $val;
				break;
			}
		}
	}

	public function jsonSerialize() {
		$data = [
			'id'	=> $this->id,
			'type'	=> $this->type,
			'name'	=> $this->name,
		];
		if($this->count !== null) {
			$data['count'] = $this->count;
		}
		if($this->zeroTime) {
			$data['zeroTime'] = $this->zeroTime;
		}
		return $data;
	}

	public function getId() {
		return $this->id;
	}

	public function getCount() {
		return $this->count;
	}

	public function getZeroTime() {
		return $this->zeroTime;
	}

	public function reduceCount($count = 1) {
		$this->count -= $count;
		if($this->count < 1) {
			$this->zeroTime = time();
		}
		return $this->count;
	}

	public function addCount($amount) {
		if(!$this->count) {
			$this->count = 0;
		}
		$this->count += $amount;

		return $this->count;
	}

	public function makeReservation($amount) {
		if(!$this->count) {
			$this->count = 0;
		}
		if($this->count < $amount) {
			return $this->count;
		}
		return $amount;
	}
}