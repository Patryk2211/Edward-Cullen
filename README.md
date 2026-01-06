# Edward Cullen - Personal Organizer

Kompleksowa aplikacja webowa do zarządzania codziennymi zadaniami, nawykami, finansami oraz życzeniami. Aplikacja została zaprojektowana jako Single Page Application (SPA) wykorzystująca wyłącznie technologie frontendowe.

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Spis treści

- [Funkcjonalności](#-funkcjonalności)
- [Struktura projektu](#-struktura-projektu)
- [Instalacja](#-instalacja)
- [Użycie](#-użycie)
- [Moduły aplikacji](#-moduły-aplikacji)
- [Technologie](#-technologie)
- [Architektura](#-architektura)

## ✨ Funkcjonalności

Aplikacja składa się z pięciu głównych modułów:

- **Habit Tracker** - śledzenie codziennych nawyków z wizualizacją kalendarzową
- **Kosztorys** - zarządzanie finansami (wydatki i przychody) z analityką
- **TodoList** - lista zadań z priorytetami i kategoriami
- **Calendar View** - widok kalendarzowy z integracją zadań
- **WishList** - lista życzeń z możliwością śledzenia kosztów

## 📁 Struktura projektu

```
Edward-Cullen/
├── Edward.html          # Główny plik HTML z strukturą aplikacji
├── script.js            # Logika aplikacji (736 linii kodu)
├── style/
│   └── style.css       # Style CSS (861 linii kodu)
├── dokumentacja.html    # Szczegółowa dokumentacja techniczna
├── Podsumowanie_zmian.html
└── README.md            # Ten plik
```

## 🚀 Instalacja

Aplikacja nie wymaga instalacji. Wystarczy:

1. Pobrać pliki projektu
2. Upewnić się, że struktura folderów jest zachowana
3. Otworzyć `Edward.html` w przeglądarce

### Wymagania

- Nowoczesna przeglądarka internetowa (Chrome, Firefox, Edge, Safari)
- Wsparcie dla JavaScript ES6+
- Wsparcie dla LocalStorage API
- Wsparcie dla Canvas API (dla wykresów)

### Uruchomienie przez serwer lokalny (zalecane)

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

Następnie otwórz: `http://localhost:8000/Edward.html`

## 💡 Użycie

1. Otwórz `Edward.html` w przeglądarce
2. Domyślnie otworzy się moduł **Habit Tracker**
3. Użyj nawigacji w lewym sidebarze, aby przełączać się między modułami
4. Kliknij przyciski **"+"** aby dodać nowe elementy
5. Wszystkie dane zapisują się automatycznie w LocalStorage

## 🎯 Moduły aplikacji

### 1. Habit Tracker

**Lokalizacja w kodzie:** `script.js` linie 74-150

**Funkcje:**
- Kalendarz miesięczny z klikalnymi dniami
- Automatyczne czerwone pola dla dni w przeszłości (nie wykonane)
- Zielone pola dla wykonanych dni
- Pasek postępu pokazujący procent wykonania
- Usuwanie nawyków

### 2. Kosztorys

**Lokalizacja w kodzie:** `script.js` linie 152-260

**Funkcje:**
- Dodawanie wydatków i przychodów
- 7 kategorii transakcji (jedzenie, transport, praca, rozrywka, zdrowie, zakupy, inne)
- Lista wszystkich transakcji
- Podsumowanie finansowe (wydatki, przychody, bilans)
- Wykres kołowy wydatków według kategorii (Canvas API)

### 3. TodoList

**Lokalizacja w kodzie:** `script.js` linie 262-330

**Funkcje:**
- Dodawanie zadań z tytułem, opisem, priorytetem, kategorią
- 3 poziomy priorytetów (niski, średni, wysoki)
- 3 kategorie (dom, szkoła, praca)
- Filtrowanie po priorytecie, kategorii, statusie
- Sortowanie według priorytetu
- Oznaczanie jako wykonane
- Integracja z Calendar View (zadania z datą)

### 4. Calendar View

**Lokalizacja w kodzie:** `script.js` linie 332-400

**Funkcje:**
- Kalendarz miesięczny z nawigacją między miesiącami
- Wyświetlanie liczby zadań na każdym dniu
- Kliknięcie na dzień pokazuje zadania na ten dzień
- Integracja z TodoList

### 5. WishList

**Lokalizacja w kodzie:** `script.js` linie 402-470

**Funkcje:**
- Dodawanie życzeń z nazwą, ceną (opcjonalnie), opisem
- Oznaczanie spełnionych życzeń
- Podsumowanie statystyk (wszystkie, spełnione, do spełnienia)
- Szacowany koszt wszystkich niespełnionych życzeń
- Połączenie z modułem Budżet

## 🔧 Kluczowe mechanizmy

### LocalStorage
Wszystkie dane zapisywane lokalnie w przeglądarce (4 klucze: `habits`, `transactions`, `todos`, `wishes`)

### State Management
Centralny obiekt `state` zarządza wszystkimi danymi (`script.js` linie 2-10)

### Modular Architecture
Każdy moduł ma funkcje `init*Module()` i `render*()`

### Nawigacja
Przełączanie modułów przez sidebar (`script.js` linie 30-72)

### Modale
Formularze dodawania elementów w overlay (`Edward.html` linie 148-207)

## 🎨 Design i UX

- **Ciemny motyw** z paletą kolorów (turkusowy `#4ECDC4` jako główny akcent)
- **Responsywny layout** - dostosowanie do różnych ekranów (CSS linie 800+)
- **Animacje i przejścia** dla lepszego UX
- **Wizualne wskaźniki**: kolory dla priorytetów, statusów, postępu

### Paleta kolorów

| Element | Kolor | Kod hex |
|---------|-------|---------|
| Tło główne | Ciemny szary | `#111` |
| Sidebar | Ciemny szary | `#1e1e1e` |
| Karty/Kontenery | Średni szary | `#2a2a2a` |
| Akcent (główny) | Turkusowy | `#4ECDC4` |
| Akcent (drugi) | Niebieski | `#45B7D1` |
| Błąd/Wydatki | Czerwony | `#FF6B6B` |
| Tekst | Jasny szary | `#e0e0e0` |

## 📊 Statystyki projektu

- **5 modułów** - wszystkie zgodnie z założeniami
- **~30 funkcji** - inicjalizacja, renderowanie, obsługa zdarzeń
- **4 typy danych** - habits, transactions, todos, wishes
- **Brak zależności** - czysty JavaScript, HTML, CSS (bez frameworków)
- **~736 linii** kodu JavaScript
- **~861 linii** kodu CSS

## 🏗️ Architektura

### Wzorzec architektoniczny
Aplikacja wykorzystuje wzorzec **Modular Architecture** z centralnym zarządzaniem stanem.

### Przepływ danych
1. **Inicjalizacja** - dane ładowane z LocalStorage do obiektu state
2. **Interakcja użytkownika** - zdarzenia wywołują funkcje modyfikujące state
3. **Renderowanie** - funkcje renderujące aktualizują DOM na podstawie state
4. **Zapis** - zmiany w state są zapisywane do LocalStorage

### Struktura modułów
Każdy moduł posiada:
- `init[Module]Module()` - funkcja inicjalizująca moduł
- `render[Module]()` - funkcja renderująca dane modułu
- Funkcje pomocnicze specyficzne dla modułu

## 📚 Dokumentacja

Szczegółowa dokumentacja techniczna dostępna w pliku `dokumentacja.html`.

## 🛠️ Technologie

- **HTML5** - struktura aplikacji
- **CSS3** - style i responsywność
- **JavaScript (ES6+)** - logika aplikacji
- **LocalStorage API** - przechowywanie danych
- **Canvas API** - wykresy kołowe

## 📝 Licencja

Projekt edukacyjny - do użytku osobistego.

## 👤 Autor

Edward Cullen - Personal Organizer v1.0

---

**Uwaga:** Wszystkie dane są przechowywane lokalnie w przeglądarce. Wyczyszczenie danych przeglądarki (cache, cookies, LocalStorage) spowoduje utratę wszystkich danych aplikacji.

