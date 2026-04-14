import { supabase } from './supabaseClient';

/**
 * Supabase 기반 초고속 데이터 로더
 * 기존의 전체 CSV 다운로드 방식(20초)을 대체하여, 
 * 필요한 성분만 실시간으로 서버에서 쿼리해오는 방식을 사용합니다.
 */

// 성분 검색 (국문명 기준 - RPC 호출을 통한 고성능 검색)
export const searchIngredients = async (searchTerm) => {
    if (!searchTerm) return [];
    
    // SQL 함수(RPC)를 사용하여 특수문자 대응 및 정확성 기반 정렬을 서버에서 수행합니다.
    const { data, error } = await supabase.rpc('search_ingredients_optimized', {
        search_term: searchTerm
    });

    if (error) {
        console.error('Error searching ingredients via RPC:', error);
        // Fallback: 에러 시 기존 방식 시도
        const { data: fallbackData } = await supabase
            .from('ingredients')
            .select('*')
            .or(`kor_name.ilike.%${searchTerm}%,eng_name.ilike.%${searchTerm}%`)
            .limit(50);
        return fallbackData || [];
    }

    return data;
};

// 특정 성분 하나만 가져오기 (이름 정확히 일치)
export const getIngredientByName = async (korName) => {
    const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('kor_name', korName)
        .limit(1)
        .single();
    
    if (error) return null;
    return data;
};

// 개별 성분의 규제 정보 가져오기
export const getRegulatoryInfo = async (korName) => {
    const { data, error } = await supabase
        .from('regulatory_info')
        .select('*')
        .eq('kor_name', korName);

    if (error) {
        console.error('Error fetching regulatory info:', error);
        return [];
    }
    
    // UI 프로퍼티에 맞게 필드명 변환 (snake_case -> camelCase)
    return data.map(r => ({
        regType: r.reg_type,
        noticeName: r.notice_name,
        provis: r.provis,
        limitCond: r.limit_cond,
        country: r.country
    }));
};

// 유럽 상세 정보 (CosIng) 가져오기
export const getCosIngInfo = async (inciName) => {
    if (!inciName) return null;
    const { data, error } = await supabase
        .from('cosing')
        .select('*')
        .eq('matching_inci', inciName.toUpperCase())
        .limit(1)
        .single();
    if (error) return null;
    
    // UI에 맞는 필드로 변환
    return {
        ...data,
        engNameOrig: data.eng_name_orig,
        mathingInci: data.matching_inci,
        cosingRefNo: data.cosing_ref_no,
        inciName: data.inci_name,
        innName: data.inn_name,
        phEurName: data.ph_eur_name,
        casNo: data.cas_no,
        ecNo: data.ec_no,
        chemIupacName: data.chem_iupac_name,
        otherRestrictions: data.other_restrictions,
        annexNo: data.annex_no,
        updateDate: data.update_date
    };
};

// 일본 상세 정보 가져오기
export const getJapanInfo = async (korName) => {
    const { data, error } = await supabase
        .from('japan')
        .select('*')
        .eq('jp_name', korName)
        .limit(1)
        .single();
    if (error) return null;
    
    // UI에 맞는 필드로 변환
    return {
        ...data,
        engNameOrig: data.eng_name_orig,
        mathingInci: data.matching_inci,
        jpNo: data.jp_no,
        jpName: data.jp_name,
        inciName: data.inci_name,
        regClass: data.reg_class,
        casRn: data.cas_rn,
        organicVal: data.organic_val,
        inorganicVal: data.inorganic_val
    };
};

// 관련 원료 정보 가져오기
export const getMaterialInfo = async (korName) => {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('ingredient_name', korName);
    if (error) return [];
    
    // UI에 맞는 필드로 변환
    return data.map(m => ({
        productName: m.coos_kor_name || m.ingredient_name,
        supplier: m.coos_status || '정보없음', 
        maker: m.coos_type,
        composition: m.coos_structure,
        status: m.coos_status
    }));
};

// 인기 성분 순위 업데이트...
export const updateIngredientView = async (korName) => {
    // 1. 기존 카운트 확인
    const { data: current } = await supabase
        .from('ingredient_views')
        .select('count')
        .eq('name', korName)
        .single();

    if (current) {
        // 2. 존재하면 카운트 증가
        await supabase
            .from('ingredient_views')
            .update({ count: current.count + 1, last_updated: new Date() })
            .eq('name', korName);
    } else {
        // 3. 없으면 새로 생성
        await supabase
            .from('ingredient_views')
            .insert([{ name: korName, count: 1 }]);
    }
};

// 인기 순위 Top 10 가져오기
export const getPopularRanking = async () => {
    const { data, error } = await supabase
        .from('ingredient_views')
        .select('*')
        .order('count', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching ranking:', error);
        return [];
    }
    return data;
};
