import webscraper


def fetchData(urls):
    '''
    Collects event data from known event urls to train model
    '''
    i = 0
    for url in urls:
        soup = webscraper.parsePage(urls)
        if soup is None:
            print("No HTML found: " + url)
            continue
        text = soup.get_text(separator=" ", strip=True)
        with open(i + ".txt", "w") as file:
            file.write(text)
