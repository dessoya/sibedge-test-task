<?php

class Storehouse extends ProductHolder implements JsonSerializable {

	const ProductInitialCount = 50;

	public function __construct($params = null) {

		parent::__construct();
		if($params === null) {
			$goods = Goods::getList();
			foreach ($goods as $product) {
				$product = $this->addProduct($product->getId());
				$product->setProps([
					"count" => Storehouse::ProductInitialCount
				]);
			}
		}
		else {
			foreach($params['products'] as $id => $info) {
				$product = $this->addProduct($id);
				$product->setProps($info);
			}			
		}

	}

	public function jsonSerialize() {
		return [ 'products' => $this->jsonSerialize_products() ];
	}

}