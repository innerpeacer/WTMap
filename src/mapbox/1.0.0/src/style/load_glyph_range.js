// @flow

import { getArrayBuffer, ResourceType } from '../util/ajax';

import parseGlyphPBF from './parse_glyph_pbf';

import type {StyleGlyph} from './style_glyph';
import type {RequestManager} from '../util/mapbox';
import type {Callback} from '../types/callback';
import GlyphCacheDB from "../cache/glyph_cache_db";

export default function (fontstack: string,
                           range: number,
                           urlTemplate: string,
                           requestManager: RequestManager,
                           callback: Callback<{[number]: StyleGlyph | null}>) {
    const begin = range * 256;
    const end = begin + 255;

    const request = requestManager.transformRequest(
        requestManager.normalizeGlyphsURL(urlTemplate)
            .replace('{fontstack}', fontstack)
            .replace('{range}', `${begin}-${end}`),
        ResourceType.Glyphs);

    GlyphCacheDB.get(request.url, function (data) {
        const glyphs = {};
        for (const glyph of parseGlyphPBF(data.data)) {
            glyphs[glyph.id] = glyph;
        }
        callback(null, glyphs);
    }, function (error) {
        getArrayBuffer(request, (err: ?Error, data: ?ArrayBuffer) => {
            if (err) {
                callback(err);
            } else if (data) {
                const glyphs = {};

                GlyphCacheDB.put(request.url, data);

                for (const glyph of parseGlyphPBF(data)) {
                    glyphs[glyph.id] = glyph;
                }

                callback(null, glyphs);
            }
        });
    });

    // getArrayBuffer(request, (err: ?Error, data: ?ArrayBuffer) => {
    //     if (err) {
    //         callback(err);
    //     } else if (data) {
    //         const glyphs = {};
    //
    //         for (const glyph of parseGlyphPBF(data)) {
    //             glyphs[glyph.id] = glyph;
    //         }
    //
    //         callback(null, glyphs);
    //     }
    // });
}
