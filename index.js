const vkWidgetBlock = document.querySelector('.vk-widget-wrapper');
const vkWidgetPosts = document.querySelector('.vk-widget_posts');

// Вытаскиваем токен после авторизации
const _token = window.location.hash.split("=")[1].split("&")[0]

// Массив постов для localstorage
let posts = [];
// Кол-во постов подгружаемых постов за раз
const postsPerTime = 10;

// Смещение, необходимое для выборки определённого подмножества записей.
let offset = 0;


// Функция загрузки постов из VK api
function getVKPosts() {
    // Используем Open api и VK.Api.call для авторизации и вызова методов VK api
    VK.Api.call('wall.get', {
            owner_id: -103562966,
            domain: 'dangrachev',
            count: postsPerTime,
            offset: offset,
            access_token: _token,
            v: 5.131
        },
        (res) => {
            if (res.response.ok) {
                const newPosts = res.response.items;

                // Проходимся по newPosts и создаем шаблон для каждого поста
                const html = newPosts.map((post) => `
                  <div class="vk-widget_post">
                    <img class="vk-widget_post-img" src=${post.attachments[0]['photo']?.sizes[4].url}>
                    <div class="vk-widget_post-title">${post.text}</div>
                    <div class="vk-widget_post-date">${new Date(post.date * 1000).toLocaleDateString()}</div>
                  </div>
                `).join('');

                // Добавляем новые посты
                vkWidgetPosts.insertAdjacentHTML('beforeend', html);

                // Добавляем новые посты к уже подгруженным
                posts = [...posts, ...newPosts];

                // Меняем смещение
                offset = offset + postsPerTime;

                // Устанавливаем слежку за последним элементом
                const lastPost = document.querySelector('.vk-widget_post:last-child');
                observer.observe(lastPost);
            }
        });


}


// Используем Intersection Observer API для слежки за пересечением последнего поста
const observer = new IntersectionObserver(posts => {
    posts.forEach(post => {
        if (post.isIntersecting) {
            // Если пересекаемый пост является наблюдаемым, подгружаем новые посты
            getVKPosts();
        }
    });
});

// Сохраняем посты в localstorage
function savePostsToLocalstorage() {
    localStorage.setItem('posts', JSON.stringify(posts)); //! сохраняем массив постов в localStorage
    localStorage.setItem('offset', offset); //! сохраняем смещение в localStorage
}

// Загрузка кэшированных данных при перезагрузке страницы
function getCachedPosts() {
    // Получаем посты и семещение
    const cachedPosts = localStorage.getItem('posts');
    const cachedOffset = localStorage.getItem('offset');

    if (cachedPosts) {
        posts = JSON.parse(cachedPosts);
        offset = cachedOffset ? parseInt(cachedOffset) : 0;

        const html = posts.map((post) => `
            <div class="vk-widget_post">
                <img class="vk-widget_post-img" src=${post.attachments[0]['photo']?.sizes[4].url}>
                <div class="vk-widget_post-title">${post.text}</div>
                <div class="vk-widget_post-date">${new Date(post.date * 1000).toLocaleDateString()}</div>
            </div>
          `).join('');

        vkWidgetPosts.insertAdjacentHTML('beforeend', html);
    }
}


// При переполнении localStorage, вытесняем старые посты новыми
function postsReplacement(endIndex) {
    // Обрезаем массив постов, оставляя новые
    posts.splice(0, endIndex);

    const html = posts.map((post) => `
          <div class="vk-widget_post">
            <img class="vk-widget_post-img" src=${post.attachments[0]['photo']?.sizes[4].url}>
            <div class="vk-widget_post-title">${post.text}</div>
            <div class="vk-widget_post-date">${new Date(post.date * 1000).toLocaleDateString()}</div>
          </div>
        `).join('');

    vkWidgetPosts.innerHTML = html;
}

// Проверяем localStorage на переполнение
function checkLocalStorage() {
    const size = JSON.stringify(posts).length;

    if (size > 5000000) {
        // Получаем индекс середины массива постов
        const endIndex = Math.round(posts.length / 2);

        // Вытесняем старые посты
        postsReplacement(endIndex);

        // Кэшируем оставшиеся посты
        savePostsToLocalstorage();
    }
}



function initWidget() {
    // Загружаем посты из localstorage, если они есть или при перезагрузке страницы
    getCachedPosts();

    // Подгружаем при первом рендере
    getVKPosts();

    // Проверяем localStorage с интервалом в 2 сек
    setInterval(checkLocalStorage, 2000);
}
initWidget();