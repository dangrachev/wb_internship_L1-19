const vkWidgetPosts = document.querySelector('.vk-widget_posts');

// Вытаскиваем токен после авторизации
const _token = window.location.hash.split("=")[1].split("&")[0]

const community_id = 136363489;

// Объект сообщества
let community;

// Массив постов для localstorage
let posts = [];
// Кол-во постов подгружаемых постов за раз
const postsPerTime = 10;

// Смещение, необходимое для выборки определённого подмножества записей.
let offset = 0;


// Функция получает информацию о сообществе (берем название и фотку)
function getVKCommunity() {
    if (!localStorage.getItem('community')) {
        VK.Api.call('groups.getById', {
            access_token: _token,
            group_id: community_id,
            v: 5.131
        }, (res) => {
            if (res.response) {
                community = {
                    name: res.response[0].name,
                    img: res.response[0].photo_100
                };
                localStorage.setItem('community', JSON.stringify(community));
            }
        });
    } else {
        community = JSON.parse(localStorage.getItem('community'));
    }
}

// Функция загружает посты с VK api
function getVKPosts() {
    // Используем Open api и VK.Api.call для авторизации и вызова методов VK api
    VK.Api.call('wall.get', {
            access_token: _token,
            owner_id: -Math.abs(community_id),
            domain: 'dangrachev',
            count: postsPerTime,
            offset: offset,
            v: 5.131
        },
        (res) => {
            if (res.response) {
                const newPosts = res.response.items;

                // Проходимся по newPosts и создаем шаблон для каждого поста
                const html = newPosts.map((post) => `
                  <div class="vk-widget_post">
                    <div class="vk-widget_community-info">
                        <div class="vk-widget_community-img">
                            <img src=${community.img} />
                        </div>
                        <div>
                            <div class="vk-widget_community-name">${community.name}</div>
                            <div class="vk-widget_post-date">${new Date(post.date * 1000).toLocaleDateString()}</div>
                        </div>
                    </div>
                    
                    <div class="vk-widget_post-content">
                        <div class="vk-widget_post-message">${post.text}</div>
                        
                        <div class="vk-widget_post-media">
                            <img class="vk-widget_post-img" src=${post.attachments[0]['photo']?.sizes[4].url} />
                        </div>
                    </div>
                    
                    <div class="vk-widget_post-info">
                        <div>
                            <span>❤ ${post.likes.count}</span>
                            <span>💬 ${post.comments.count}</span>
                            <span>⮌ ${post.reposts.count}</span>
                        </div>
                        
                        <div>
                            <span>👁 ${post.views.count}</span> 
                        </div>
                    </div>
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
    localStorage.setItem('posts', JSON.stringify(posts));
    localStorage.setItem('offset', offset);
}

// Функция подгружает кэшированные посты
function getCachedPosts() {
    // Получаем посты и семещение
    const cachedPosts = localStorage.getItem('posts');
    const cachedOffset = localStorage.getItem('offset');

    if (cachedPosts) {
        posts = JSON.parse(cachedPosts);
        offset = cachedOffset ? parseInt(cachedOffset) : 0;

        const html = posts.map((post) => `
            <div class="vk-widget_post">
                <div class="vk-widget_community-info">
                    <div class="vk-widget_community-img">
                        <img src=${community.img} />
                    </div>
                    
                    <div class="vk-widget_community-name">${community.name}</div>
                    <div class="vk-widget_post-date">${new Date(post.date * 1000).toLocaleDateString()}</div>
                </div>
                
                <div class="vk-widget_post-content">
                    <div class="vk-widget_post-message">${post.text}</div>
                    
                    <div class="vk-widget_post-media">
                        ${post.attachments[0]['photo']} && 
                            <img class="vk-widget_post-img" src=${post.attachments[0]['photo']?.sizes[4].url} />
                    </div>
                </div>
                
                <div class="vk-widget_post-info">
                    <div>
                        <span>❤ ${post.likes.count}</span>
                        <span>💬 ${post.comments.count}</span>
                        <span>⮌ ${post.reposts.count}</span>
                    </div>
                    
                    <div>
                        <span>👁 ${post.views.count}</span> 
                    </div>
                </div>
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
                <div class="vk-widget_community-info">
                    <div class="vk-widget_community-img">
                        <img src=${community.img} />
                    </div>
                    
                    <div class="vk-widget_community-name">${community.name}</div>
                    <div class="vk-widget_post-date">${new Date(post.date * 1000).toLocaleDateString()}</div>
                </div>
                
                <div class="vk-widget_post-content">
                    <div class="vk-widget_post-message">${post.text}</div>
                    
                    <div class="vk-widget_post-media">
                        ${post.attachments[0]['photo']} && 
                            <img class="vk-widget_post-img" src=${post.attachments[0]['photo']?.sizes[4].url} />
                    </div>
                </div>
                
                <div class="vk-widget_post-info">
                    <div>
                        <span>❤ ${post.likes.count}</span>
                        <span>💬 ${post.comments.count}</span>
                        <span>⮌ ${post.reposts.count}</span>
                    </div>
                    
                    <div>
                        <span>👁 ${post.views.count}</span> 
                    </div>
                </div>
          </div>
        `).join('');

    vkWidgetPosts.innerHTML = html;
}

// Проверяем localStorage на переполнение
function checkLocalStorage() {
    const size = JSON.stringify(posts).length;

    // Примерный объем localstorage в chrome, взят из 18 задания
    if (size > 4194304) {
        // Получаем индекс середины массива постов
        const endIndex = Math.round(posts.length / 2);

        // Вытесняем старые посты
        postsReplacement(endIndex);

        // Кэшируем оставшиеся посты
        savePostsToLocalstorage();
    }
}

function initWidget() {
    // Получаем инфу о сообществе
    getVKCommunity();

    // Загружаем посты из localstorage, если они есть или при перезагрузке страницы
    getCachedPosts();

    // Подгружаем посты при первом рендере
    getVKPosts();

    // Проверяем localStorage с интервалом в 2 сек
    setInterval(checkLocalStorage, 2000);
}
initWidget();
