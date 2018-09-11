<?php

class ProductHolder {
	public function __construct() {
		$this->products = [ ];
	}

	public function addProduct($productId, $count = null) {
		return $this->products[$productId] = new Product($productId, $count);
	}

	public function jsonSerialize_products() {
		$products = [ ];
		foreach($this->products as $id => $product) {
			$products[$id] = $product->jsonSerialize();
		}
		return $products;
	}

	public function getProducts() {
		return $this->products;
	}

	public function getProductById($productId) {
		if(isset($this->products[$productId])) {
			return $this->products[$productId];
		}
		return null;
	}

	public function enumerateProducts($callback) {
		foreach($this->products as $product) {
			$callback($product);
		}
	}

	public function deleteProductById($productId) {
		if(isset($this->products[$productId])) {
			unset($this->products[$productId]);
		}

	}

}