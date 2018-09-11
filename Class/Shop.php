<?php

class Shop extends ProductHolder implements JsonSerializable {

	const ProductInitialCount = 10;

	public function __construct($id, $types, $products = null) {
		parent::__construct();
		$this->id = $id;
		$this->types = $types;
		if($products === null) {			
			$list = Product::getListByTypes($types);
			$lcnt = count($list);
			$cnt = random_int(floor($lcnt / 2), $lcnt - 1);
			if($cnt < 1) $cnt = 1;
			$products = [];
			$used = [];
			for($i = 0; $i < $cnt; $i++) {
				while(true) {
					$idx = random_int(0, $lcnt - 1);
					$id = $list[$idx]->getId();
					if(isset($used[$id])) continue;
					$used[$id] = true;
					$product = $this->addProduct($id);
					$product->setProps([
						"count" => Shop::ProductInitialCount
					]);
					break;
				}
			}
		}
		else {
			foreach($products as $item) {
				$product = $this->addProduct($item['id']);
				$product->setProps([
					"count" => $item['count']
				]);
				if(isset($item['zeroTime'])) {
					$product->setProps([
						"zeroTime" => $item['zeroTime']
					]);
				}
			}
		}		
	}	

	public function jsonSerialize() {
		$p = [];
		foreach($this->products as $id => $product) {
			$i = [ 'id' => $id, 'count' => $product->getCount() ];
			if($product->getZeroTime()) {
				$i['zeroTime'] = $product->getZeroTime();
			}
			$p[] = $i;
		}
		return [ 'id' => $this->id, 'types' => $this->types, 'products' => $p ];
	}

	public function getRandomProduct() {
		$products = $this->getProducts();
		$list = [];
		foreach($products as $product) {
			$list[] = $product;
		}
		if(count($list) < 1) {
			return null;
		}
		return $list[random_int(0, count($list) - 1)];
	}

	public function getId() {
		return $this->id;
	}

}