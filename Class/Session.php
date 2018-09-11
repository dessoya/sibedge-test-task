<?php

class Session {

	const Event_setProduct = "setProduct";
	const Event_delProduct = "delProduct";
	const Event_delShop = "delShop";
	const Event_addShop = "addShop";
	const Event_transferProduct = "transferProduct";
	const Event_restart = "restart";

	static public function generateShopId() {
		if(!isset($_SESSION['shopIdIterator'])) {
			$_SESSION['shopIdIterator'] = 1;
		}
		$id = $_SESSION['shopIdIterator'];
		$_SESSION['shopIdIterator'] ++;
		return $id;
	}

	function __construct() {
		if(!$_SESSION['treat_time']) {
			$_SESSION['treat_time'] = time();
		}
		$this->storehouse = new Storehouse($_SESSION['storehouse']);
		$this->shops = new Shops($_SESSION['shops']);

		if(!isset($_SESSION['events'])) {
			$_SESSION['events'] = [ ];
		}
		$this->events = $_SESSION['events'];

	}

	function addEvent(...$args) {
		$this->events[] = $args;
	}

	function getEvents() {
		return $this->events;
	}

	function getStorehouse() {
		return $this->storehouse;
	}

	function getShops() {
		return $this->shops;
	}

	function flush() {
		$_SESSION['storehouse'] = $this->storehouse->jsonSerialize();
		$_SESSION['shops'] = $this->shops->jsonSerialize();
		$_SESSION['events'] = $this->events;
	}

	function treatEntities() {

		$mergeEvents = [];
		$restart = false;
		foreach($this->events as &$event) {
			$name = $event[0];
			switch($name) {

				case Session::Event_restart:

					$mergeEvents = [];
					$this->events = [];

					unset($_SESSION['storehouse']);
					unset($_SESSION['shops']);
					$_SESSION['treat_time'] = time();
					$_SESSION['shopIdIterator'] = 1;
					unset($_SESSION['events']);

					$this->storehouse = new Storehouse();
					$this->shops = new Shops();

					$mergeEvents[] = [ Session::Event_restart ];

					$restart = true;

				break;

				case Session::Event_delShop:
					$shopId = $event[1];
					$shops = $this->getShops();
					$shops->deleteShop($shopId);
				break;

				case Session::Event_addShop:
					$types = $event[1];					
					$shop = new Shop(Session::generateShopId(), $types);
					$this->getShops()->addShop($shop);
					$event[] = $shop->getId();

					foreach($shop->getProducts() as $product) { 
						$mergeEvents[] = [ Session::Event_setProduct, $shop->getId(), $product->getId(), [ "count" => $product->getCount() ] ];
					}
				break;

				case Session::Event_transferProduct:
					$shopId = $event[1];
					$productId = $event[2];

					// check for availability of product in storehouse
					$storehouse = $this->getStorehouse();
					$product = $storehouse->getProductById($productId);

					if($product) {
						$amount = $product->makeReservation(10);
						if($amount > 0) {

							$shops = $this->getShops();
							$shop = $shops->getShop($shopId);
							if($shop) {
								$storehouseProductCount = $product->reduceCount($amount);
								$shopProduct = $shop->getProductById($productId);
								if($shopProduct === null) {
									$shopProduct = $shop->addProduct($productId);
								}
								$count = $shopProduct->addCount($amount);
								$mergeEvents[] = [ Session::Event_setProduct, -1, $productId, [ "count" => $storehouseProductCount ] ];
								$mergeEvents[] = [ Session::Event_setProduct, $shopId, $productId, [ "count" => $count ] ];
							}
							else {
								// error no shop with shopId
							}
						}
						else {
							// error no product amount in storehouse
						}
					}
					else {
						// error no product in storehouse

					}

				break;
				
			}
			if($restart) {
				break;
			}
		}
		unset($event);

		$this->events = array_merge($this->events, $mergeEvents);

		$time = time();
		$delta = $time - $_SESSION['treat_time'];
		$_SESSION['treat_time'] = $time;
		for($i = 0; $i < $delta; $i++) {
			$shops = $this->getShops();
			$shop = $shops->getRandomShop();
			if($shop === null) continue;

			$count = count($shop->getProducts());
			while($count--) {
				$product = $shop->getRandomProduct();
				$cnt = $product->getCount();
				if($cnt < 1) continue;
			
				$count = $product->reduceCount();
				$this->addEvent(Session::Event_setProduct, $shop->getId(), $product->getId(), [ "count" => $count ] );
				
				break;
			}
		}

		// check for product deleting
		$self = $this;
		$this->getShops()->enumerateShops(function($shop) use ($self, $time){
			$shop->enumerateProducts(function($product) use ($shop, $self, $time) {
				$zeroTime = $product->getZeroTime();				
				if($zeroTime && $time - $zeroTime >= 10) {
					$self->addEvent(Session::Event_delProduct, $shop->getId(), $product->getId());
					$shop->deleteProductById($product->getId());
				}
			});
		});
	}

	function deleteEvents() {
		$this->events = [ ];
	}
}