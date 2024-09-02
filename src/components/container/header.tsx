export default function Footer() {
    return (
        <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
            {/* <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 ring-offset-0 sm:gap-x-6 sm:px-6 lg:px-0 lg:ring-offset-0"> */}
            <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-0">
                <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
                    <span className="t">Open sidebar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" className="h-6 w-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg>
                </button>
                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <form className="relative flex flex-1">
                        <label htmlFor="search-field" className="t">Search</label>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"></path></svg>
                        <input id="search-field" name="search" type="search" placeholder="Search..." class="lu pn tu afh art atx atz ayb bgg bnf cng"></input>
                    </form>
                    <div></div>
                </div>
                Header
            </div>
        </div>
    );
}