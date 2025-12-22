<?php
session_start();

// --- Подключение к БД ---
$pdo = new PDO("mysql:host=localhost;dbname=CoolShop;charset=utf8mb4","root","",[
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
]);

// --- Логика входа ---
if(isset($_POST['login'])){
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
    $stmt->execute([$_POST['email']]);
    $user = $stmt->fetch();
    if($user && password_verify($_POST['password'],$user['password'])){
        $_SESSION['user'] = $user;
        $_SESSION['user']['role'] = $_POST['role'] ?? 'user';
        header("Location: shop.php?page=index"); exit;
    } else $error = "Неверный логин или пароль";
}

// --- Логика регистрации ---
if(isset($_POST['register'])){
    $stmt = $pdo->prepare("INSERT INTO users (username,email,password) VALUES (?,?,?)");
    $stmt->execute([$_POST['username'], $_POST['email'], password_hash($_POST['password'], PASSWORD_DEFAULT)]);
    $msg = "Регистрация успешна, войдите в систему";
}

// --- Добавление товара в корзину ---
if(isset($_POST['add_to_cart'])){
    $pid = $_POST['product_id'];
    if(!isset($_SESSION['cart'])) $_SESSION['cart'] = [];
    $_SESSION['cart'][$pid] = ($_SESSION['cart'][$pid] ?? 0) + 1;
}

// --- Оформление заказа ---
if(isset($_POST['checkout']) && isset($_SESSION['user'])){
    $cart = $_SESSION['cart'] ?? [];
    if($cart){
        $total = 0;
        foreach($cart as $pid=>$qty){
            $stmt = $pdo->prepare("SELECT price FROM products WHERE id=?");
            $stmt->execute([$pid]);
            $price = $stmt->fetchColumn();
            $total += $price * $qty;
        }

        $stmt = $pdo->prepare("INSERT INTO orders (user_id,total) VALUES (?,?)");
        $stmt->execute([$_SESSION['user']['id'],$total]);
        $order_id = $pdo->lastInsertId();

        foreach($cart as $pid=>$qty){
            $stmt = $pdo->prepare("SELECT price FROM products WHERE id=?");
            $stmt->execute([$pid]);
            $price = $stmt->fetchColumn();

            $stmt2 = $pdo->prepare("INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)");
            $stmt2->execute([$order_id,$pid,$qty,$price]);
        }

        unset($_SESSION['cart']);
        $checkout_msg = "Ваш заказ принят! Номер заказа: #{$order_id}";
    }
}

// --- Выбор страницы ---
$page = $_GET['page'] ?? 'index';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>CoolShop</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>

<!-- HEADER -->
<header class="site-header">
<div class="wrap">
<div class="logo"><a href="shop.php?page=index">CoolShop</a></div>
<nav class="main-nav">
  <a href="shop.php?page=index">Главная</a>
  <a href="shop.php?page=products">Каталог</a>
  <a href="shop.php?page=cart">Корзина (<?= array_sum($_SESSION['cart'] ?? []) ?>)</a>
  <a href="shop.php?page=about">О нас</a>
  <?php if(isset($_SESSION['user'])): ?>
      <a href="shop.php?logout=1">Выйти</a>
  <?php else: ?>
      <a href="shop.php?page=login">Вход</a>
      <a href="shop.php?page=register">Регистрация</a>
  <?php endif; ?>
  <?php if(isset($_SESSION['user']) && $_SESSION['user']['role']=='admin'): ?>
      <a href="shop.php?page=admin">Админка</a>
  <?php endif; ?>
</nav>
</div>
</header>

<div class="wrap">

<?php
// ---------- Страницы ----------

// Главная
if($page=='index'){ ?>
<section class='hero'>
  <h1>Добро пожаловать в CoolShop!</h1>
  <p>Лучшие товары по отличным ценам</p>
  <a class='btn' href='shop.php?page=products'>Перейти в каталог</a>
</section>
<?php }

// Каталог
if($page=='products'){
  $products = $pdo->query("SELECT * FROM products ORDER BY created_at DESC")->fetchAll();
  echo "<h1>Каталог товаров</h1><div class='grid'>";
  foreach($products as $p){
    echo "<div class='card'>
            <img src='{$p['image']}' alt='{$p['name']}' class='product-img'>
            <h3>{$p['name']}</h3>
            <div class='price'>{$p['price']} ₸</div>
            <form method='post'>
              <input type='hidden' name='product_id' value='{$p['id']}'>
              <button class='btn' name='add_to_cart'>В корзину</button>
            </form>
          </div>";
  }
  echo "</div>";
}

// Корзина
if($page=='cart'){
  $cart = $_SESSION['cart'] ?? [];
  if($cart){
    $ids = implode(",", array_keys($cart));
    $products = $pdo->query("SELECT * FROM products WHERE id IN ($ids)")->fetchAll();
    $total = 0;
    echo "<table class='cart-table'><tr><th>Товар</th><th>Цена</th><th>Кол-во</th></tr>";
    foreach($products as $p){
      $total += $p['price']*$cart[$p['id']];
      echo "<tr><td>{$p['name']}</td><td>{$p['price']} ₸</td><td>{$cart[$p['id']]}</td></tr>";
    }
    echo "<tr class='total'><td>Итого</td><td colspan='2'>{$total} ₸</td></tr></table>";

    // Кнопка оформления заказа
    echo "<form method='post'><button class='btn' name='checkout'>Оформить заказ</button></form>";
    if(isset($checkout_msg)) echo "<p style='color:lime;'>$checkout_msg</p>";
  } else echo "<p>Корзина пуста</p>";
}

// Регистрация
if($page=='register'){ ?>
<h1>Регистрация</h1>
<?php if(isset($msg)) echo "<p style='color:lime;'>$msg</p>"; ?>
<form method='post'>
  <input type='text' name='username' placeholder='Имя' required>
  <input type='email' name='email' placeholder='Email' required>
  <input type='password' name='password' placeholder='Пароль' required>
  <button class='btn' name='register'>Зарегистрироваться</button>
</form>
<?php }

// Вход
if($page=='login'){ ?>
<h1>Вход</h1>
<?php if(isset($error)) echo "<p style='color:red;'>$error</p>"; ?>
<form method='post'>
  <input type='email' name='email' placeholder='Email' required>
  <input type='password' name='password' placeholder='Пароль' required>
  <input type='hidden' name='role' value='user'>
  <button class='btn' name='login'>Войти как пользователь</button>
</form>
<form method='post'>
  <input type='email' name='email' placeholder='Email' required>
  <input type='password' name='password' placeholder='Пароль' required>
  <input type='hidden' name='role' value='admin'>
  <button class='btn' name='login'>Войти как админ</button>
</form>
<?php }

// Админка
if($page=='admin' && isset($_SESSION['user']) && $_SESSION['user']['role']=='admin'){
  if(isset($_POST['add_product'])){
    $stmt = $pdo->prepare("INSERT INTO products (name, price, image, description) VALUES (?,?,?,?)");
    $stmt->execute([$_POST['name'],$_POST['price'],$_POST['image'],$_POST['description']]);
    echo "<p style='color:lime;'>Товар добавлен</p>";
  }
  $products = $pdo->query("SELECT * FROM products ORDER BY created_at DESC")->fetchAll();
  echo "<h1>Админка</h1><form method='post'>
          <input type='text' name='name' placeholder='Название'>
          <input type='text' name='price' placeholder='Цена'>
          <input type='text' name='image' placeholder='Ссылка на изображение'>
          <textarea name='description' placeholder='Описание'></textarea>
          <button class='btn' name='add_product'>Добавить товар</button>
        </form>";
  echo "<div class='grid'>";
  foreach($products as $p){
    echo "<div class='card'>
            <img src='{$p['image']}' alt='{$p['name']}'>
            <h3>{$p['name']}</h3>
            <div class='price'>{$p['price']} ₸</div>
          </div>";
  }
  echo "</div>";
}

// О нас
if($page=='about'){
  echo "<h1>О нас</h1><p>CoolShop — ваш неоновый онлайн-магазин!</p>";
}

?>
</div>
</body>
</html>
