<?php

class Shops implements JsonSerializable {

	static public function getTypes() {
		$types = [];
		$ptypes = Product::getTypes();
		foreach ($ptypes as $value) {
			$types[] = [ $value ];			
		}

		$exists = [];
		foreach ($ptypes as $value) {			
			foreach ($ptypes as $value2) {
				if($value == $value2) continue;
				if($value < $value2) {
					$key = $value . '-' . $value2;
				}
				else {
					$key = $value2 . '-' . $value;
				}
				if(!isset($exists[$key])) {
					$exists[$key] = true;
					$types[] = [ $value, $value2 ];
				}
			}
		}
		return $types;
	}

	public function __construct($list = null) {
		if($list === null) {
			$types = Shops::getTypes();
			$list = [ ];
			$used = [ ];
			for($i = 0; $i < 4; $i++) {
				while(true) {
					$idx = random_int(0, count($types) - 1);
					$key = implode(',', $types[$idx]);
					if(isset($used[$key])) continue;

					$used[$key] = true;
					$shop = new Shop(Session::generateShopId(), $types[$idx]);
        	        $list[] = $shop;
					break;
				}
			}
			$this->list = $list;
		}
		else {
			$this->list = [ ];
			foreach($list as $item) {
				$this->list[] = new Shop($item['id'], $item['types'], $item['products']);
			}
		}
		
	}

	public function addShop($shop) {
		$this->list[] = $shop;
	}

	public function getShop($shopId) {
		foreach($this->list as $idx => $shop) {
			if($shopId == $shop->getId()) {
				return $shop;
			}
		}		
		return null;
	}

	public function jsonSerialize() {
		$list = [ ];
		foreach($this->list as $shop) {
			$list[] = $shop->jsonSerialize();
		}
		return $list;
	}

	public function getRandomShop() {
		if(count($this->list) < 1) {
			return null;
		}
		return $this->list[random_int(0, count($this->list) - 1)];
	}

	public function deleteShop($shopId) {
		foreach($this->list as $idx => $shop) {
			if($shopId == $shop->getId()) {
				array_splice($this->list, $idx, 1);
				return;
			}
		}
	}

	public function enumerateShops($callback) {
		foreach($this->list as $shop) {
			$callback($shop);
		}
	}
}